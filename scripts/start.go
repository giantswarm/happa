package main

import (
	"bufio"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strings"
)

func main() {
	err := replacePlaceholders()
	if err != nil {
		log.Fatal(err)
	}

	err = gzip("/www/index.html")
	if err != nil {
		log.Fatal(err)
	}

	err = gzip("/www/metadata.json")
	if err != nil {
		log.Fatal(err)
	}

	err = createNginxResolver()
	if err != nil {
		log.Fatal(err)
	}

	runNginx()
}

func replacePlaceholders() error {
	log.Println("Reading VERSION file...")
	versionBytes, err := ioutil.ReadFile("VERSION")
	if err != nil {
		return err
	}
	version := strings.TrimSpace(string(versionBytes))
	log.Println("Read VERSION file")

	log.Println("Replacing placeholder values in '/www/index.html'...")
	indexBytes, err := ioutil.ReadFile("/www/index.html")
	if err != nil {
		return err
	}
	index := string(indexBytes)
	var replaced bool

	index, _ = replaceWithEnvVar(index, "API_ENDPOINT", "apiEndpoint", true)
	index, _ = replaceWithEnvVar(index, "MAPI_ENDPOINT", "mapiEndpoint", true)
	index, _ = replaceWithEnvVar(index, "AUDIENCE", "audience", true)
	index, _ = replaceWithEnvVar(index, "MAPI_AUDIENCE", "mapiAudience", true)
	index, _ = replaceWithEnvVar(index, "PASSAGE_ENDPOINT", "passageEndpoint", true)
	index, _ = replaceWithEnvVar(index, "INGRESS_BASE_DOMAIN", "ingressBaseDomain", true)
	if v, ok := os.LookupEnv("PROVIDER"); ok && v == "aws" {
		index, _ = replaceWithEnvVar(index, "AWS_CAPABILITIES_JSON", "awsCapabilitiesJSON", true)
	}
	if v, ok := os.LookupEnv("PROVIDER"); ok && v == "azure" {
		index, _ = replaceWithEnvVar(index, "AZURE_CAPABILITIES_JSON", "azureCapabilitiesJSON", true)
	}
	index, _ = replaceWithEnvVar(index, "DEFAULT_REQUEST_TIMEOUT_SECONDS", "defaultRequestTimeoutSeconds", false)
	index, replaced = replaceWithEnvVar(index, "ENVIRONMENT", "environment", true)
	if !replaced {
		index = replace(index, "environment", "docker-container", true)
	}
	index, _ = replaceWithEnvVar(index, "MAPI_AUTH_REDIRECT_URL", "mapiAuthRedirectURL", true)
	index, _ = replaceWithEnvVar(index, "MAPI_AUTH_ADMIN_GROUP", "mapiAuthAdminGroup", true)
	{
		v, ok := os.LookupEnv("FEATURE_MAPI_AUTH")
		index = replace(index, "FEATURE_MAPI_AUTH", ok && v == "TRUE", false)
	}
	{
		v, ok := os.LookupEnv("ENABLE_RUM")
		if ok && v == "TRUE" {
			log.Println("RUM is enabled")
		}
		index = replace(index, "enableRealUserMonitoring", ok && v == "TRUE", false)
	}
	index = replace(index, "happaVersion", version, true)

	if err := os.WriteFile("/www/index.html", []byte(index), os.ModePerm); err != nil {
		return err
	}
	log.Println("Replaced placeholder values in '/www/index.html'")

	log.Println("Replacing placeholder values in '/www/metadata.json'...")
	metadataBytes, err := ioutil.ReadFile("/www/metadata.json")
	if err != nil {
		return err
	}
	metadata := string(metadataBytes)

	metadata = replace(metadata, `"version"`, fmt.Sprintf("\"%s\"", version), false)

	if err := os.WriteFile("/www/metadata.json", []byte(index), os.ModePerm); err != nil {
		return err
	}
	log.Println("Replaced placeholder values in '/www/metadata.json'")

	return nil
}

func gzip(path string) error {
	log.Printf("Gzipping '%s'...", path)
	err := exec.Command("gzip", "-f", "-9", "-k", path).Run()
	if err != nil {
		return err
	}
	log.Printf("Gzipped '%s'", path)
	return nil
}

func createNginxResolver() error {
	log.Printf("Creating '/etc/nginx/resolvers.conf'...")
	resolvBytes, err := ioutil.ReadFile("/etc/resolv.conf")
	if err != nil {
		return err
	}
	resolv := string(resolvBytes)

	nameserver := ""
	for _, line := range strings.Split(resolv, "\n") {
		if strings.HasPrefix(line, "nameserver") {
			nameserver = strings.Split(line, " ")[1]
			break
		}
	}

	if nameserver == "" {
		return errors.New("nameserver IP not found!")
	}

	nameserver = fmt.Sprintf("resolver %s;", nameserver)
	err = os.WriteFile("/etc/nginx/resolvers.conf", []byte(nameserver), os.ModePerm)
	if err != nil {
		return err
	}

	log.Printf("Created '/etc/nginx/resolvers.conf'")
	return nil
}

func runNginx() {
	log.Println("--- Starting Happa nginx server ---")
	cmd := exec.Command("nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;")
	stdout, _ := cmd.StdoutPipe()

	scanner := bufio.NewScanner(stdout)
	scanner.Split(bufio.ScanLines)

	cmd.Start()
	for scanner.Scan() {
		msg := scanner.Text()
		fmt.Fprintln(os.Stdout, msg)
	}
	cmd.Wait()
}

func replaceWithEnvVar(src, envName, varName string, quote bool) (out string, replaced bool) {
	v, ok := os.LookupEnv(envName)
	if !ok {
		return src, false
	}

	out = replace(src, varName, v, quote)

	return out, true
}

func replace(src, varName string, v interface{}, quote bool) (out string) {
	pattern := regexp.MustCompile(fmt.Sprintf("%s: .*", varName))
	var replacement string
	if quote {
		replacement = fmt.Sprintf("%s: '%v',", varName, v)
	} else {
		replacement = fmt.Sprintf("%s: %v,", varName, v)
	}
	return pattern.ReplaceAllString(src, replacement)
}
