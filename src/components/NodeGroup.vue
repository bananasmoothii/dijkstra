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
      type: Object as () => GraphNode,
      required: true
    },
    linkNodesMode: {
      type: Boolean,
      default: false
    }
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
        const nodesToAdd = [this.graph];
        const excludedNodesLines: GraphNode[] = [];
        console.log(this.graph);
        while (nodesToAdd.length > 0) {
          const node1 = nodesToAdd.pop() as GraphNode;
          this.nodes.push(node1);
          for (const link1 of node1.links) {
            // adding node
            let node2 = link1.node;
            if (!this.nodes.includes(node2)) {
              nodesToAdd.push(node2);
            }

            // adding line between nodes, but not adding both lines because our graph is undirected
            if (this.links.some(link => link.node1 == node2 && link.node2 == node1)) continue;
            let link2: {node: GraphNode, linkWeight: number} | undefined = undefined;
            for (let link2Test of node2.links) {
              if (link2Test.node.key === node1.key) {
                link2 = link2Test;
                break;
              }
            }
            if (link2 == undefined) throw new Error("Link not found, graph is not valid");
            this.links.push({
              node1,
              node2,
              base: {
                hue: node2.display.hue,
                graphWeight: link1.linkWeight,
                updateGraphWeight(newWeight: number) {
                  link1.linkWeight = newWeight;
                  if (link2 != undefined) link2.linkWeight = newWeight;
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
      line.base.updateGraphWeight(newWeight);
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