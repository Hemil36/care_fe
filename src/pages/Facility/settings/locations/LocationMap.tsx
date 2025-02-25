import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { LocationNode } from "@/types/location/location";

import { LocationIcon } from "./components/LocationCard";

export default function LocationMap(props: { locations: LocationNode[] }) {
  const { locations } = props;

  const nodes = locations.map((location, index) => ({
    id: location.id,
    position: { x: 400 * index, y: 100 },
    data: {
      label: (
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary-200 text-primary-600 flex items-center justify-center w-8 aspect-square">
            <LocationIcon form={location.form} />
          </div>
          {location.name}
        </div>
      ),
    },
  }));

  const edges = [{ id: "e1-2", source: "1", target: "2" }];

  return (
    <div className="w-full h-[calc(100vh-200px)] border rounded-lg border-gray-300">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(e) => console.log(e)}
        onEdgesChange={(e) => console.log(e)}
        onConnect={(e) => console.log(e)}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
