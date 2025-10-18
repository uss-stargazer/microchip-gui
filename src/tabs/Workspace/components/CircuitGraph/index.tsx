import type { VisNetworkConfig } from "../../../../hooks/useVisNetwork";
import useVisNetwork from "../../../../hooks/useVisNetwork";

function CircuitGraph({ config }: { config: VisNetworkConfig }) {
  const { networkRef, network } = useVisNetwork(config);
  return <div ref={networkRef} />;
}

export default CircuitGraph;
