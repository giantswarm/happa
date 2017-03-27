# Set up some variables

EXPIRY="2019-01-01T00:00:00Z"
ADMIN_TOKEN="test"
ENDPOINT="http://localhost:9000"
USERNAME="developer"
EMAIL="developer@example.com"
PASSWORD="Y29ycmVjdF9wYXNzd29yZA==" # "correct_password"

# Create some new account
curl -i -X POST \
  -H "Authorization: giantswarm ${ADMIN_TOKEN}" \
  "${ENDPOINT}/v1/user/" \
  -d "{
  \"username\": \"${USERNAME}\",
  \"email\": \"${EMAIL}\",
  \"password\": \"${PASSWORD}\",
  \"expiry\": \"${EXPIRY}\"
}"