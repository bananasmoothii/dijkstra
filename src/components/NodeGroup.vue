<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from '@/logic/node'
import GraphNodeButton from "@/components/GraphNodeButton.vue";

type DataType = {
  lines: Line[],
  nodes: GraphNode[],
}

type Coord = { x: number, y: number };

type Line = {
  center: Coord,
  length: number,
  angle: number,
  hue: number,
}

export default defineComponent({
  name: "NodeGroup",
  components: {GraphNode: GraphNodeButton},
  props: {
    graph: {
      type: Object as () => GraphNode | null,
      required: true
    },
  },
  data(): DataType {
    return {
      lines: [],
      nodes: [],
    }
  },
  watch: {
    graph: {
      immediate: true,
      handler() {
        this.nodes = [];
        this.lines = [];
        if (this.graph == null) return;
        const nodesToAdd = [this.graph];
        while (nodesToAdd.length > 0) {
          const node = nodesToAdd.pop() as GraphNode;
          this.nodes.push(node);
          for (const link of node.links) {
            let node1 = link.node;
            if (!this.nodes.includes(node1)) {
              nodesToAdd.push(node1);
            }
            this.addLineBetweenNodes(node, node1, node.display.hue);
          }
        }
      }
    }
  },
  methods: {
    addLineBetweenNodes(start: GraphNode, end: GraphNode, hue: number) {
      this.addLine(start.display, end.display, hue);
    },
    addLine(start: Coord, end: Coord, hue: number) {
      // distance
      const length = Math.sqrt(((end.x - start.x) * (end.x - start.x)) + ((end.y - start.y) * (end.y - start.y)));
      // center
      const center: Coord = {
        x: ((start.x + end.x) / 2) - (length / 2),
        y: ((start.y + end.y) / 2) - (1 / 2),
      };
      // angle (radians)
      const angle = Math.atan2((start.y - end.y), (start.x - end.x));

      this.lines.push({
        center,
        length,
        angle,
        hue,
      });
    },
  }
})
</script>

<template>
  <div ref="lines-container">
    <div class="line" v-for="line in lines" :key="line"
         :style="{left: line.center.x + 'px', top: line.center.y + 'px', width: line.length + 'px', transform: `rotate(${line.angle}rad)`, '--hue': line.hue}">
    </div>
  </div>
  <div ref="nodes-container">
    <GraphNode :nodes="nodes"/>
  </div>
</template>

<style scoped lang="scss">
@import "@/scss/custom";

.line {
  position: absolute;
  border-radius: 1px;
  padding: 0;
  margin: 0;
  height: 2px;
  line-height: 1px;
  background-color: hsl(var(--hue), 88%, 50%);
}

</style>