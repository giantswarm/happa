// Placeholding for now
          <p>Generate and download a cluster configuration file for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster, including a key pair for administrative access.</p>

          {
            this.props.allClusters.length > 1 ?
            <div className='well select-cluster'>
              <div className="select-cluster--dropdown-container">
                <label>Select Cluster:</label>
                <DropdownButton id="cluster-slect-dropdown" title={this.props.cluster.id}>
                  {
                    _.map(this.props.allClusters,
                      clusterId => <MenuItem key={clusterId} onClick={this.selectCluster.bind(this, clusterId)}>{clusterId}</MenuItem>
                    )
                  }
                </DropdownButton>
              </div>

              <p><strong>Watch out:</strong> The key-pair and configuration will be specific for one cluster. As you have access to more than one cluster, please make sure this is the right one.</p>
              <p>You might have access to additional clusters after switching to a different organization.</p>
            </div>
            :
            undefined
          }

          {
            this.state.keyPair.generated
            ?
              this.kubeConfig()
            :
              <div className='create-key-pair'>
                <Button bsStyle="primary" loading={this.state.keyPair.generating} onClick={this.generateKeyPair}>Create cluster configuration</Button>
                <p><strong>This will create a configuration file containing a new key pair</strong></p>
                <div className='key-pair-error'>
                {
                  this.state.keyPair.error
                  ?
                    <div className="flash-messages--flash-message flash-messages--danger">
                      Request failed. Please try again later or contact support
                    </div>
                  :
                    null
                }
                </div>
              </div>
          }

          <p>Once generated, please save that file to your file system with the name <code>giantswarm-kubeconfig</code>.</p>

          <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it&apos;s only accessible to authorized users.</p>

          <p>Now change into the directory containing the <code>giantswarm-kubeconfig</code> file in a terminal.</p>

          <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this (replacing <code>/path/to</code> with your actual path):</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG="\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig"`}
            </Prompt>
          </CodeBlock>

          <div className="aside">
          <p><i className='fa fa-graduation-cap' title='For learners'></i> To save some time in the future, add the command above to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>
          </div>

          <p>The above config file also sets the current context to `giantswarm-default`. You can check this with</p>

          <CodeBlock>
            <Prompt>
              {`kubectl config view`}
            </Prompt>
          </CodeBlock>

          <p>If another context is selected and whenever you want to switch back to working with your Giant Swarm cluster, use this command:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl config use-context giantswarm-default`}
            </Prompt>
          </CodeBlock>

          <div className="aside">
          <p><i className='fa fa-graduation-cap' title='For learners'></i> Again, here you can save your future self some time by creating an alias.</p>
          </div>

          <p>Then you can check if you got access to your cluster with:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl cluster-info`}
            </Prompt>
          </CodeBlock>

          <p>Now let&apos;s start something on your cluster.</p>