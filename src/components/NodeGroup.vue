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
  movingLine: Line | null,
  maxLinkDistance: number,
  newNodeShadow: {
    x: number,
    y: number,
    width: number,
    height: number,
    hoveringNode: GraphNode | null,
  } | null,
  lastTimeShadowOnShadow: number,
}

export type Coord = { x: number, y: number };

export type LineBase = {
  hue: number,
  graphWeight: number,
  updateGraphWeight: (newWeight: number) => void,
}

export type Link = {
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
      movingLine: null,
      maxLinkDistance: 60,
      newNodeShadow: null,
      lastTimeShadowOnShadow: 0,
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
        let {nodes, links} = this.graph.getGraphNodesAndLinks();
        this.nodes = nodes;
        this.links = links;
      },
      deep: true,
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
      if (this.linkNodesMode) {
        this.movingNode = {
          node,
          offset: {
            x: 0,
            y: 0,
          }
        };
        this.movingLine = this.computeLine(node.display, { // mouse coords
          x: event.clientX,
          y: event.clientY
        }, {
          hue: node.display.hue,
          graphWeight: 1,
          updateGraphWeight: () => {
            throw new Error("Cannot update weight of a line that doesn't exist");
          }
        });
      } else {
        this.movingNode = {
          node,
          offset: {
            x: event.clientX - node.display.x,
            y: event.clientY - node.display.y,
          }
        };
        let htmlNode = document.getElementById('node-' + node.key) as HTMLElement;
        htmlNode.classList.add('dragging');
      }
    },
    mouseMove(event: MouseEvent) {
      if (this.movingNode == null) return;
      if (this.linkNodesMode) {
        let x = event.clientX;
        let y = event.clientY;
        this.movingLine = this.computeLine(this.movingNode.node.display, {x, y}, this.movingLine!.base);
        let closestNodeExceptMovingNode = this.getClosestNodeExceptMovingNode(x, y);
        let {node, distanceSquared} = closestNodeExceptMovingNode || {node: null, distanceSquared: Infinity};
        if (this.newNodeShadow == null) this.newNodeShadow = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          hoveringNode: null,
        };
        if (distanceSquared > this.square(this.maxLinkDistance)) {
          this.newNodeShadow.x = x;
          this.newNodeShadow.y = y;
          this.newNodeShadow.width = 45;
          this.newNodeShadow.height = 37;
          this.newNodeShadow.hoveringNode = null;
        } else {
          this.newNodeShadow.x = node!.display.x;
          this.newNodeShadow.y = node!.display.y;
          this.newNodeShadow.width = document.getElementById('node-' + node!.key)!.clientWidth + 8;
          this.newNodeShadow.height = document.getElementById('node-' + node!.key)!.clientHeight + 8;
          this.newNodeShadow.hoveringNode = node;
        }
      } else {
        this.movingNode.node.display.x = event.clientX - this.movingNode.offset.x;
        this.movingNode.node.display.y = event.clientY - this.movingNode.offset.y;
      }
      const htmlNode = document.getElementById('node-' + this.movingNode.node.key) as HTMLElement;
      htmlNode.focus({preventScroll: true});
    },
    square(x: number): number {
      return x * x;
    },
    getClosestNodeExceptMovingNode(x: number, y: number): { node: GraphNode, distanceSquared: number } | null {
      if (this.nodes.length <= 1) return null;
      return this.nodes
          .filter((node: GraphNode) => node.key !== this.movingNode?.node.key)
          .map((node: GraphNode) => {
            let distanceSquared = this.square(node.display.x - x) + this.square(node.display.y - y);
            return {node, distanceSquared};
          })
          .reduce((prev: { node: GraphNode, distanceSquared: number }, curr: {
            node: GraphNode,
            distanceSquared: number
          }) => prev.distanceSquared < curr.distanceSquared ? prev : curr);
    },
    distanceSquaredBetweenNodes(node: GraphNode, coordTo: Coord): number {
      return this.square(node.display.x - coordTo.x) + this.square(node.display.y - coordTo.y);
    },
    mouseUp(e: MouseEvent) {
      if (this.movingNode == null) return;
      if (this.linkNodesMode) {
        let x = e.clientX;
        let y = e.clientY;
        let nodeAndDistance = this.getClosestNodeExceptMovingNode(x, y);
        if (nodeAndDistance && nodeAndDistance.distanceSquared <= this.square(this.maxLinkDistance)) {
          this.movingNode.node.linkOrDestroyLinkTo(nodeAndDistance.node, 1);
        } else if // don't create nodes too close
        (this.distanceSquaredBetweenNodes(this.movingNode.node, {x, y}) > this.square(this.maxLinkDistance)) {
          // create new node
          let newNodeName = "";
          const withNumberRegex = /^(.*)(\d+)$/;
          let results = withNumberRegex.exec(this.movingNode.node.name);
          if (results) {
            let name = results[1];
            let number = parseInt(results[2]);
            newNodeName = name + (number + 1);
          } else {
            newNodeName = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][Math.floor(Math.random() * 10)] + "1";
          }
          let newNode = new GraphNode(newNodeName);
          newNode.display.x = x;
          newNode.display.y = y;
          this.movingNode.node.linkTo(newNode, 1);
        }
      } else {
        let htmlNode = document.getElementById('node-' + this.movingNode.node.key) as HTMLElement;
        htmlNode.classList.remove('dragging');
      }
      this.movingNode = null;
      this.movingLine = null;
      this.newNodeShadow = null;
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
    },
    newNodeShadowStyle() {
      let style = {
        left: this.newNodeShadow?.x + 'px',
        top: this.newNodeShadow?.y + 'px',
        width: this.newNodeShadow?.width + 'px',
        height: this.newNodeShadow?.height + 'px',
        transition: undefined as string | undefined,
        borderRadius: '2em',
      }
      let now = Date.now();
      let hoveringNode = this.newNodeShadow?.hoveringNode;
      if (hoveringNode != null) {
        style.transition = 'all 0.3s ease-out';
        if (hoveringNode.key === this.graph.key) {
          style.borderRadius = '5px'
        }
        this.lastTimeShadowOnShadow = now;
      } else if (now - this.lastTimeShadowOnShadow <= 410) {
        style.transition = 'all 0.3s ease-out';
      }
      return style;
    }
  },
  computed: {
    lines(): Line[] {
      return this.links.map(link => this.computeLine(link.node1.display, link.node2.display, link.base));
    },
  }
})
</script>

<template>
  <div ref="lines-container">
    <GraphLine v-for="line in lines" :key="line" :line="line"
               @update:weight="newWeight => updateLineWeight(line, newWeight)"/>
    <GraphLine v-if="movingLine" :line="movingLine" noweight/>
  </div>
  <div ref="nodes-container">
    <GraphNodeButton v-for="node in nodes" :key="node.key" :id="'node-' + node.key" :node="node"
                     @mousedown="e => mouseDown(node, e)"
                     @update:name="e => buttonUpdatedName(e, node)"
                     @spanfocusout="e => e.target.innerText = node.name"
                     @keydown.enter.prevent="blurFocus"/>
  </div>
  <div v-if="newNodeShadow != null" :style="newNodeShadowStyle()" class="node-shadow">
  </div>
</template>

<style scoped lang="scss">
.node-shadow {
  position: absolute;
  background-color: rgba(100%, 100%, 100%, 25%);
  border: none;
  transform: translate(-50%, -50%);
  padding: .4em .5em;
  transition: all 0.3s ease-out, top 0s linear, left 0s linear;
  box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.4);
}
</style>