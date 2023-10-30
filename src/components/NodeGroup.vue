<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from '@/logic/node'
import GraphNodeButton from "@/components/GraphNodeButton.vue";
import GraphLine from "@/components/GraphLine.vue";

type DataType = {
  links: Link[],
  nodes: GraphNode[],
  movingNode: {
    node: GraphNode,
    offset: Coord,
  } | null,
}

type Coord = { x: number, y: number };

type LineBase = {
  hue: number,
  graphWeight: number,
  updateGraphWeight: (newWeight: number) => void,
}

type Link = {
  node1: GraphNode,
  node2: GraphNode,
  base: LineBase
};

export type Line = {
  center: Coord,
  length: number,
  angle: number,
  base: LineBase,
};

export default defineComponent({
  name: "NodeGroup",
  components: {GraphLine, GraphNodeButton},
  props: {
    graph: {
      type: Object as () => GraphNode | null,
      required: true
    },
  },
  data(): DataType {
    return {
      links: [],
      nodes: [],
      movingNode: null,
    }
  },
  mounted() {
    document.onmousemove = this.mouseMove;
    document.onmouseup = this.mouseUp;
  },
  watch: {
    graph: {
      immediate: true,
      handler() {
        this.nodes = [];
        this.links = [];
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
            this.links.push({
              node1: node,
              node2: node1,
              base: {
                hue: node.display.hue,
                graphWeight: link.linkWeight,
                updateGraphWeight(newWeight: number) {
                  link.linkWeight = newWeight;
                  for (let link1 of node1.links) {
                    if (link1.node.key === node.key) {
                      link1.linkWeight = newWeight;
                    }
                  }
                }
              }
            });
          }
        }
      }
    }
  },
  methods: {
    computeLine(start: Coord, end: Coord, base: LineBase): Line {
      // distance
      const length = Math.sqrt(((end.x - start.x) * (end.x - start.x)) + ((end.y - start.y) * (end.y - start.y)));
      // center
      const center: Coord = {
        x: ((start.x + end.x) / 2) - (length / 2),
        y: ((start.y + end.y) / 2) - (1 / 2),
      };
      // angle (radians)
      const angle = Math.atan2((start.y - end.y), (start.x - end.x));

      return {center, length, angle, base};
    },
    mouseDown(node: GraphNode, event: MouseEvent) {
      this.movingNode = {
        node,
        offset: {
          x: event.clientX - node.display.x,
          y: event.clientY - node.display.y,
        }
      };
      let htmlNode = document.getElementById('node-' + node.key) as HTMLElement;
      htmlNode.classList.add('dragging');
    },
    mouseMove(event: MouseEvent) {
      if (this.movingNode == null) return;
      this.movingNode.node.display.x = event.clientX - this.movingNode.offset.x;
      this.movingNode.node.display.y = event.clientY - this.movingNode.offset.y;
    },
    mouseUp() {
      if (this.movingNode == null) return;
      let htmlNode = document.getElementById('node-' + this.movingNode.node.key) as HTMLElement;
      htmlNode.classList.remove('dragging');
      this.movingNode = null;
    },
    buttonUpdatedName(event: Event, node: GraphNode) {
      let target = event.target as HTMLSpanElement;
      if (!target.innerText.trim()) return;
      node.name = target.innerText.trim();
      for (let link of this.links) {
        if (link.node1 == node || link.node2 == node) {
          link.base.hue = node.display.hue;
        }
      }
    },
    updateLineWeight(line: Line, newWeight: number) {
      line.base.graphWeight = newWeight;
    },
    blurFocus() {
      (document.activeElement as HTMLElement)?.blur();
    }
  },
  computed: {
    lines(): Line[] {
      return this.links.map(link => this.computeLine(link.node1.display, link.node2.display, link.base));
    }
  }
})
</script>

<template>
  <div ref="lines-container">
    <GraphLine v-for="line in lines" :key="line" :line="line"
               @update:weight="newWeight => updateLineWeight(line, newWeight)"/>
  </div>
  <div ref="nodes-container">
    <GraphNodeButton v-for="node in nodes" :key="node.key" :id="'node-' + node.key" :node="node"
                     @mousedown="e => mouseDown(node, e)"
                     @update:name="e => buttonUpdatedName(e, node)"
                     @spanfocusout="e => e.target.innerText = node.name"
                     @keydown.enter.prevent="blurFocus"/>
  </div>
</template>