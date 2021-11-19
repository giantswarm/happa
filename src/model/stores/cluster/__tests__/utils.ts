import { IIDsAwaitingUpgradeMap } from 'model/stores/cluster/types';
import {
  canClusterUpgrade,
  computeCapabilities,
  getClusterLatestCondition,
  getCpusTotal,
  getCpusTotalNodePools,
  getInstanceTypesForProvider,
  getMemoryTotal,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
  getNumberOfNodes,
  getStorageTotal,
  guessProviderFromNodePools,
  isClusterCreating,
  isClusterDeleting,
  isClusterUpdating,
  reconcileClustersAwaitingUpgrade,
  v4orV5,
} from 'model/stores/cluster/utils';
import { IState } from 'model/stores/state';
import { Providers } from 'shared/constants';
import { INodePool, INodePoolStatus, PropertiesOf } from 'shared/types';
import {
  v4AWSClusterResponse,
  v4AWSClusterStatusResponse,
  v5ClusterResponse,
} from 'test/mockHttpCalls';
import preloginState from 'test/preloginState';

describe('cluster::utils', () => {
  describe('canClusterUpgrade', () => {
    describe('all providers', () => {
      it('returns false if the provided versions are empty', () => {
        expect(canClusterUpgrade(undefined, '1', 'aws')).toBeFalsy();
        expect(canClusterUpgrade('1', undefined, 'aws')).toBeFalsy();
      });

      it('returns false if the target version is a pre-release one', () => {
        expect(
          canClusterUpgrade('1.0.0', '1.0.1-alpha', Providers.AWS)
        ).toBeFalsy();
        expect(
          canClusterUpgrade('1.0.0', '1.0.1-beta+somebuild', Providers.AZURE)
        ).toBeFalsy();
        expect(
          canClusterUpgrade('1.0.0', '1.0.1+somebuild', Providers.KVM)
        ).toBeFalsy();
      });
    });

    describe('on azure', () => {
      it('is true for any version', () => {
        const can = canClusterUpgrade('8.1.0', '9.0.0', 'azure');
        expect(can).toBe(true);
      });
    });

    describe('on aws', () => {
      it('is true when going from <10.0.0 to <10.0.0', () => {
        const can = canClusterUpgrade('8.1.0', '9.0.0', 'aws');
        expect(can).toBe(true);
      });

      it('is true when going from >10.0.0 to >10.0.0', () => {
        const can = canClusterUpgrade('10.1.0', '11.0.0', 'aws');
        expect(can).toBe(true);
      });

      it('is false when going from <10.0.0 to >10.0.0', () => {
        const can = canClusterUpgrade('9.1.0', '11.0.0', 'aws');
        expect(can).toBe(false);
      });
    });

    describe('on kvm', () => {
      it('is true for any version', () => {
        const can = canClusterUpgrade('8.0.0', '11.0.0', 'kvm');
        expect(can).toBe(true);
      });
    });
  });

  describe('getNumberOfNodes', () => {
    it('returns 0 worker nodes if the cluster status is not loaded yet', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
      };

      expect(getNumberOfNodes(cluster)).toBe(0);
    });

    it('returns 0 if there are no nodes', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
      };
      expect(getNumberOfNodes(cluster)).toBe(0);

      (cluster.status as V4.IClusterStatus).cluster.nodes = null;
      expect(getNumberOfNodes(cluster)).toBe(0);
    });

    it('returns the number of total worker nodes, discarding control plane nodes', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  role: 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                labels: {},
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
      };

      expect(getNumberOfNodes(cluster)).toBe(2);
    });
  });

  describe('getMemoryTotal', () => {
    it('returns the right memory for a given number of worker nodes', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [
          {
            memory: {
              size_gb: 1.337,
            },
          } as unknown as V4.IClusterWorker,
        ],
      };
      // eslint-disable-next-line no-magic-numbers
      expect(getMemoryTotal(cluster)).toBe(2.68);
    });

    it('returns 0 for no workers', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [],
      };
      // eslint-disable-next-line no-magic-numbers
      expect(getMemoryTotal(cluster)).toBe(0);
    });
  });

  describe('getStorageTotal', () => {
    it('returns the right storage amount for a given number of worker nodes', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [
          {
            storage: {
              size_gb: 1.337,
            },
          } as unknown as V4.IClusterWorker,
        ],
      };

      // eslint-disable-next-line no-magic-numbers
      expect(getStorageTotal(cluster)).toBe(2.68);
    });

    it('returns 0 for no workers', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [],
      };
      expect(getStorageTotal(cluster)).toBe(0);

      cluster.workers = undefined;
      expect(getStorageTotal(cluster)).toBe(0);

      (cluster.status as V4.IClusterStatus).cluster.nodes = null;
      expect(getStorageTotal(cluster)).toBe(0);
    });
  });

  describe('getCpusTotal', () => {
    it('returns the right number of CPUs for a given list of workers', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [
          {
            cpu: {
              cores: 2,
            },
          } as unknown as V4.IClusterWorker,
        ],
      };

      expect(getCpusTotal(cluster)).toBe(4);
    });

    it('returns 0 for no workers', () => {
      const cluster: V4.ICluster = {
        api_endpoint: '',
        create_date: null,
        credential_id: '',
        id: '',
        owner: '',
        status: {
          cluster: {
            nodes: [
              {
                labels: {
                  'kubernetes.io/role': 'master',
                },
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
              {
                name: '',
                version: '',
                lastTransitionTime: null,
              },
            ],
          } as unknown as V4.IClusterStatusCluster,
        } as V4.IClusterStatus,
        workers: [],
      };
      expect(getCpusTotal(cluster)).toBe(0);
    });
  });

  describe('getNumberOfNodePoolsNodes', () => {
    it('returns the right total number of nodes in a given list of node pools', () => {
      const nodePools: INodePool[] = [
        {
          status: {
            nodes: 3,
          } as INodePoolStatus,
        } as INodePool,
        {
          status: {
            nodes: 5,
          } as INodePoolStatus,
        } as INodePool,
      ];

      expect(getNumberOfNodePoolsNodes(nodePools)).toBe(8);
    });

    it('returns 0 for no node pools', () => {
      expect(getNumberOfNodePoolsNodes([])).toBe(0);
    });
  });

  describe('getMemoryTotalNodePools', () => {
    it('returns the right amount of total memory in a given list of node pools, on AWS', () => {
      const initialInstanceTypes = window.config.awsCapabilitiesJSON;
      window.config.awsCapabilitiesJSON = JSON.stringify({
        gigantic: {
          memory_size_gb: 3.138,
        },
      });

      const nodePools: INodePool[] = [
        {
          node_spec: {
            aws: {
              instance_type: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            aws: {
              instance_type: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      // eslint-disable-next-line no-magic-numbers
      expect(getMemoryTotalNodePools(nodePools)).toBe(9.42);

      window.config.awsCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns the right amount of total memory in a given list of node pools, on Azure', () => {
      const initialInstanceTypes = window.config.azureCapabilitiesJSON;
      window.config.azureCapabilitiesJSON = JSON.stringify({
        gigantic: {
          memoryInMb: 3773,
        },
      });

      const nodePools: INodePool[] = [
        {
          node_spec: {
            azure: {
              vm_size: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            azure: {
              vm_size: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      // eslint-disable-next-line no-magic-numbers
      expect(getMemoryTotalNodePools(nodePools)).toBe(11.4);

      window.config.azureCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns 0 if the provider cannot be determined', () => {
      const nodePools: INodePool[] = [
        {
          node_spec: {},
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      expect(getMemoryTotalNodePools(nodePools)).toBe(0);
    });

    it('returns 0 if there are no instance types', () => {
      const initialInstanceTypes = window.config.azureCapabilitiesJSON;
      // @ts-expect-error
      delete window.config.azureCapabilitiesJSON;

      const nodePools: INodePool[] = [
        {
          node_spec: {
            azure: {
              vm_size: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            azure: {
              vm_size: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      expect(getMemoryTotalNodePools(nodePools)).toBe(0);

      window.config.azureCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns 0 if there are no node pools', () => {
      expect(getMemoryTotalNodePools([])).toBe(0);
    });
  });

  describe('getCpusTotalNodePools', () => {
    it('returns the right total number of CPUs in a given list of node pools, on AWS', () => {
      const initialInstanceTypes = window.config.awsCapabilitiesJSON;
      window.config.awsCapabilitiesJSON = JSON.stringify({
        gigantic: {
          cpu_cores: 3,
        },
        cool: {
          cpu_cores: 5,
        },
      });

      const nodePools: INodePool[] = [
        {
          node_spec: {
            aws: {
              instance_type: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            aws: {
              instance_type: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            aws: {
              instance_type: 'cool',
            },
          },
          status: {
            nodes_ready: 4,
          },
        } as INodePool,
      ];

      // eslint-disable-next-line no-magic-numbers
      expect(getCpusTotalNodePools(nodePools)).toBe(29);

      window.config.awsCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns the right total number of CPUs in a given list of node pools, on Azure', () => {
      const initialInstanceTypes = window.config.azureCapabilitiesJSON;
      window.config.azureCapabilitiesJSON = JSON.stringify({
        gigantic: {
          numberOfCores: 3,
        },
        cool: {
          numberOfCores: 5,
        },
      });

      const nodePools: INodePool[] = [
        {
          node_spec: {
            azure: {
              vm_size: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            azure: {
              vm_size: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            azure: {
              vm_size: 'cool',
            },
          },
          status: {
            nodes_ready: 4,
          },
        } as INodePool,
      ];

      // eslint-disable-next-line no-magic-numbers
      expect(getCpusTotalNodePools(nodePools)).toBe(29);

      window.config.azureCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns 0 if the provider cannot be determined', () => {
      const nodePools: INodePool[] = [
        {
          node_spec: {},
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      expect(getCpusTotalNodePools(nodePools)).toBe(0);
    });

    it('returns 0 if there are no instance types', () => {
      const initialInstanceTypes = window.config.azureCapabilitiesJSON;
      // @ts-expect-error
      delete window.config.azureCapabilitiesJSON;

      const nodePools: INodePool[] = [
        {
          node_spec: {
            azure: {
              vm_size: 'gigantic',
            },
          },
          status: {
            nodes_ready: 3,
          },
        } as INodePool,
        {
          node_spec: {},
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
        {
          node_spec: {
            azure: {
              vm_size: 'nonexistent',
            },
          },
          status: {
            nodes_ready: 5,
          },
        } as INodePool,
      ];

      expect(getCpusTotalNodePools(nodePools)).toBe(0);

      window.config.azureCapabilitiesJSON = initialInstanceTypes;
    });

    it('returns 0 if there are no node pools', () => {
      expect(getCpusTotalNodePools([])).toBe(0);
    });
  });

  describe('computeCapabilities', () => {
    describe('hasOptionalIngress', () => {
      describe('on azure', () => {
        it('is false for Azure below 12.0.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '11.0.0',
            'azure'
          );
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for Azure at 12.0.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '12.0.0',
            'azure'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for Azure above 12.0.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '13.0.0',
            'azure'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });

      describe('on aws', () => {
        it('is false for AWS below 10.1.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '9.0.0',
            'aws'
          );
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for AWS at 10.1.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '10.1.0',
            'aws'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for AWS above 10.1.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '11.1.0',
            'aws'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });

      describe('on kvm', () => {
        it('is false for KVM below 12.2.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '11.0.0',
            'kvm'
          );
          expect(capabilities.hasOptionalIngress).toBe(false);
        });

        it('is true for KVM at 12.2.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '12.2.0',
            'kvm'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });

        it('is true for KVM above 12.2.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '13.0.0',
            'kvm'
          );
          expect(capabilities.hasOptionalIngress).toBe(true);
        });
      });
    });

    describe('supportsHAMasters', () => {
      describe('on azure', () => {
        it('is false for Azure at any version', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '8.1.0',
            'azure'
          );
          expect(capabilities.supportsHAMasters).toBe(false);
        });
      });

      describe('on aws', () => {
        it('is false for AWS below 9.0.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '9.0.0',
            'aws'
          );
          expect(capabilities.supportsHAMasters).toBe(false);
        });

        it('is true for AWS at 11.4.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '11.4.0',
            'aws'
          );
          expect(capabilities.supportsHAMasters).toBe(true);
        });

        it('is true for AWS above 13.0.0', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '13.0.0',
            'aws'
          );
          expect(capabilities.supportsHAMasters).toBe(true);
        });
      });

      describe('on kvm', () => {
        it('is false for KVM at any version', () => {
          const capabilities = computeCapabilities(preloginState as never)(
            '8.0.0',
            'kvm'
          );
          expect(capabilities.supportsHAMasters).toBe(false);
        });
      });
    });
  });

  describe('getClusterLatestCondition', () => {
    it('gets the latest cluster condition, on a v5 cluster', () => {
      const cluster = Object.assign(
        {},
        v5ClusterResponse
      ) as unknown as V5.ICluster;

      expect(getClusterLatestCondition(cluster)).toBe('Created');
    });

    it('gets the latest cluster condition, on a v4 cluster', () => {
      const cluster = Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown as V4.ICluster;

      expect(getClusterLatestCondition(cluster)).toBe('Created');
    });

    it(`doesn't break if there are no conditions in a v5 cluster`, () => {
      const cluster = Object.assign({}, v5ClusterResponse, {
        conditions: undefined,
      }) as V5.ICluster;

      expect(getClusterLatestCondition(cluster)).not.toBe('Created');
    });

    it(`doesn't break if there are no conditions in a v4 cluster`, () => {
      const cluster = Object.assign({}, v4AWSClusterResponse, {
        status: undefined,
      }) as unknown as V4.ICluster;

      expect(getClusterLatestCondition(cluster)).not.toBe('Created');
    });
  });

  describe('isClusterCreating', () => {
    it('checks if the latest condition is the creating one, on a v5 cluster', () => {
      let cluster = Object.assign(
        {},
        v5ClusterResponse
      ) as unknown as V5.ICluster;
      expect(isClusterCreating(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Creating',
          },
        ],
      }) as unknown as V5.ICluster;
      expect(isClusterCreating(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the creating one, on a v4 cluster', () => {
      const cluster = Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown as V4.ICluster;
      expect(isClusterCreating(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Creating',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterCreating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterUpdating', () => {
    it('checks if the latest condition is the updating one, on a v5 cluster', () => {
      let cluster = Object.assign(
        {},
        v5ClusterResponse
      ) as unknown as V5.ICluster;
      expect(isClusterUpdating(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Updating',
          },
        ],
      }) as unknown as V5.ICluster;
      expect(isClusterUpdating(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the updating one, on a v4 cluster', () => {
      const cluster = Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown as V4.ICluster;
      expect(isClusterUpdating(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Updating',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterUpdating(cluster)).toBeTruthy();
    });
  });

  describe('isClusterDeleting', () => {
    it('checks if the latest condition is the deleting one, on a v5 cluster', () => {
      let cluster = Object.assign(
        {},
        v5ClusterResponse
      ) as unknown as V5.ICluster;
      expect(isClusterDeleting(cluster)).toBeFalsy();

      cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: new Date().toISOString(),
            condition: 'Deleting',
          },
        ],
      }) as unknown as V5.ICluster;
      expect(isClusterDeleting(cluster)).toBeTruthy();
    });

    it('checks if the latest condition is the deleting one, on a v4 cluster', () => {
      const cluster = Object.assign({}, v4AWSClusterResponse, {
        status: v4AWSClusterStatusResponse,
      }) as unknown as V4.ICluster;
      expect(isClusterDeleting(cluster)).toBeFalsy();

      cluster.status = {
        ...cluster.status,
        cluster: {
          ...cluster.status?.cluster,
          conditions: [
            {
              lastTransitionTime: new Date().toISOString(),
              type: 'Deleting',
              status: '',
            },
          ],
        },
      } as V4.IClusterStatus;

      expect(isClusterDeleting(cluster)).toBeTruthy();
    });
  });

  describe('guessProviderFromNodePools', () => {
    it(`returns 'null' for an empty NP list`, () => {
      const result = guessProviderFromNodePools([]);

      expect(result).toBeNull();
    });

    it(`returns 'aws' for an AWS node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {
            aws: { instance_type: 'm3.xlarge' },
          },
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBe('aws');
    });

    it(`returns 'azure' for an Azure node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {
            azure: { vm_size: 'm3.xlarge' },
          },
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBe('azure');
    });

    it(`returns 'null' for an unknown provider node pool list`, () => {
      const nodePools = [
        {
          id: '3jx5q',
          node_spec: {},
        },
      ] as INodePool[];
      const result = guessProviderFromNodePools(nodePools);

      expect(result).toBeNull();
    });
  });

  describe('getInstanceTypesForProvider', () => {
    const initialAWSCapabilitiesJSON = window.config.awsCapabilitiesJSON;
    const initialAzureCapabilitiesJSON = window.config.azureCapabilitiesJSON;

    afterEach(() => {
      window.config.awsCapabilitiesJSON = initialAWSCapabilitiesJSON;
      window.config.azureCapabilitiesJSON = initialAzureCapabilitiesJSON;
    });

    it('gets the correct list for the AWS provider', () => {
      const instanceTypes = getInstanceTypesForProvider('aws');
      expect(instanceTypes).toStrictEqual(
        JSON.parse(initialAWSCapabilitiesJSON)
      );
    });

    it('gets the correct list for the Azure provider', () => {
      const instanceTypes = getInstanceTypesForProvider('azure');
      expect(instanceTypes).toStrictEqual(
        JSON.parse(initialAzureCapabilitiesJSON)
      );
    });

    it(`returns 'null' for an unknown provider`, () => {
      const instanceTypes = getInstanceTypesForProvider(
        '' as PropertiesOf<typeof Providers>
      );
      expect(instanceTypes).toBeNull();
    });

    it(`returns 'null' if the capabilities are mis-configured for the current provider`, () => {
      // @ts-expect-error
      delete window.config.awsCapabilitiesJSON;
      // @ts-expect-error
      delete window.config.azureCapabilitiesJSON;

      expect(getInstanceTypesForProvider('aws')).toBeNull();
      expect(getInstanceTypesForProvider('azure')).toBeNull();
    });
  });

  describe('v4orV5', () => {
    const state: IState = {
      entities: {
        clusters: {
          v5Clusters: ['123sd', 'fas10', '349aa'],
        },
      },
    } as unknown as IState;

    const v4Fn = jest.fn();
    const v5Fn = jest.fn();

    it(`runs the 'v4' func if the cluster is not a v5 cluster`, () => {
      expect(v4orV5(v4Fn, v5Fn, '240aa', state)).toBe(v4Fn);
    });

    it(`runs the 'v5' func if the cluster is a v5 cluster`, () => {
      expect(v4orV5(v4Fn, v5Fn, 'fas10', state)).toBe(v5Fn);
    });
  });

  describe('reconcileClustersAwaitingUpgrade', () => {
    it('ignores clusters that have been deleted and removed from the list', () => {
      const clusters: IClusterMap = {
        '1sad1': v5ClusterResponse,
        sa912: v4AWSClusterResponse,
      };
      const awaitingUpgrade: IIDsAwaitingUpgradeMap = {
        sa912: true,
        g10s2: true,
      };

      expect(
        reconcileClustersAwaitingUpgrade(clusters, awaitingUpgrade)
      ).toStrictEqual({
        sa912: true,
      });
    });

    it('ignores clusters that are currently being deleted', () => {
      const v4Cluster = Object.assign({}, v4AWSClusterResponse, {
        delete_date: new Date('1970-01-01'),
      });

      const clusters: IClusterMap = {
        '1sad1': v5ClusterResponse,
        sa912: v4Cluster,
      };
      const awaitingUpgrade: IIDsAwaitingUpgradeMap = {
        '1sad1': true,
        sa912: true,
      };

      expect(
        reconcileClustersAwaitingUpgrade(clusters, awaitingUpgrade)
      ).toStrictEqual({
        '1sad1': true,
      });
    });

    it('ignores clusters that already started upgrading', () => {
      const v5Cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: '2009-01-01',
            condition: 'Updating',
          },
        ],
      });

      const clusters: IClusterMap = {
        '1sad1': v5Cluster,
        sa912: v4AWSClusterResponse,
      };
      const awaitingUpgrade: IIDsAwaitingUpgradeMap = {
        '1sad1': true,
        sa912: true,
      };

      expect(
        reconcileClustersAwaitingUpgrade(clusters, awaitingUpgrade)
      ).toStrictEqual({
        sa912: true,
      });
    });

    it('ignores clusters that have been marked for deletion', () => {
      const v5Cluster = Object.assign({}, v5ClusterResponse, {
        conditions: [
          {
            last_transition_time: '2009-01-01',
            condition: 'Deleting',
          },
        ],
      });

      const clusters: IClusterMap = {
        '1sad1': v5Cluster,
        sa912: v4AWSClusterResponse,
      };
      const awaitingUpgrade: IIDsAwaitingUpgradeMap = {
        '1sad1': true,
        sa912: true,
      };

      expect(
        reconcileClustersAwaitingUpgrade(clusters, awaitingUpgrade)
      ).toStrictEqual({
        sa912: true,
      });
    });
  });
});
