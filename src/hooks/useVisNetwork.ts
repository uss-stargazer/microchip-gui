// Based on https://codesandbox.io/p/sandbox/react-typescript-0zt5sw

import { useState, useLayoutEffect, useRef } from "react";
import {
  Network,
  type Data,
  type Edge,
  type Node,
  type Options,
} from "vis-network";

export interface VisNetworkConfig {
  nodes: Node[];
  edges: Edge[];
  options: Options;
}

function useVisNetwork({ nodes, edges, options }: VisNetworkConfig): {
  network: Network | null;
  networkRef: React.RefObject<HTMLDivElement | null>;
} {
  const [network, addNetwork] = useState<Network | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const data: Data = { nodes, edges };

  useLayoutEffect(() => {
    if (ref.current) {
      const instance = new Network(ref.current, data, options);
      addNetwork(instance);
    }
    return () => network?.destroy();
  }, []);

  return {
    network: network,
    networkRef: ref,
  };
}

export default useVisNetwork;
