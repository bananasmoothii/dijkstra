<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from '@/logic/node'
import GraphNodeButton from "@/components/GraphNodeButton.vue";

type DataType = {
  links: Link[],
  nodes: GraphNode[],
  movingNode: {
    node: GraphNode,
    offset: Coord,
  } | null,
}

type Coord = { x: number, y: number };

type Link = {
  node1: GraphNode,
  node2: GraphNode,
  hue: number,
}

type Line = {
  center: Coord,
  length: number,
  angle: number,
  hue: number,
  isShadow: boolean
};

export default defineComponent({
  name: "NodeGroup",
  components: {GraphNodeButton},
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
              hue: node.display.hue,
            });
          }
        }
      }
    }
  },
  methods: {
    computeLine(start: Coord, end: Coord, hue: number, isShadow: boolean): Line {
      // distance
      const length = Math.sqrt(((end.x - start.x) * (end.x - start.x)) + ((end.y - start.y) * (end.y - start.y)));
      // center
      const center: Coord = {
        x: ((start.x + end.x) / 2) - (length / 2),
        y: ((start.y + end.y) / 2) - (1 / 2),
      };
      // angle (radians)
      const angle = Math.atan2((start.y - end.y), (start.x - end.x));

      return {center, length, angle, hue, isShadow};
    },
    mouseDown(node: GraphNode, event: MouseEvent) {
      this.movingNode = {
        node,
        offset: {
          x: event.clientX - node.display.x,
          y: event.clientY - node.display.y,
        }
      };
      let htmlNode = document.getElementById('node-' + node.name) as HTMLElement;
      htmlNode.classList.add('dragging');
    },
    mouseMove(event: MouseEvent) {
      if (this.movingNode == null) return;
      this.movingNode.node.display.x = event.clientX - this.movingNode.offset.x;
      this.movingNode.node.display.y = event.clientY - this.movingNode.offset.y;
    },
    mouseUp() {
      if (this.movingNode == null) return;
      let htmlNode = document.getElementById('node-' + this.movingNode.node.name) as HTMLElement;
      htmlNode.classList.remove('dragging');
      this.movingNode = null;
    },
  },
  computed: {
    lines(): Line[] {
      return this.links.flatMap(link => {
        let list: Line[] = [];
        let movingNodeName = this.movingNode?.node.name;
        if (movingNodeName) {
          list.push(this.computeLine(link.node1.display, link.node2.display, link.hue, true));
          if (link.node1.name === movingNodeName) {
            let node1D = link.node1.display;
            list.push(this.computeLine({x: node1D.x - 12, y: node1D.y - 12}, link.node2.display, link.hue, false));
          } else if (link.node2.name === movingNodeName) {
            let node2D = link.node2.display;
            list.push(this.computeLine(link.node1.display, {x: node2D.x - 12, y: node2D.y - 12}, link.hue, false));
          }
        } else {
          list.push(this.computeLine(link.node1.display, link.node2.display, link.hue, false));
        }
        return list
      });
    }
  }
})
</script>

<template>
  <div ref="lines-container">
    <div class="line" v-for="line in lines" :key="line"
         :style="{left: line.center.x + 'px', top: line.center.y + 'px', width: line.length + 'px', transform: `rotate(${line.angle}rad)`, '--hue': line.hue}"
         :class="{isShadow: line.isShadow}">
    </div>
  </div>
  <div ref="nodes-container">
    <GraphNodeButton v-for="node in nodes" :key="node.name" :id="'node-' + node.name" :node="node"
                     @mousedown="e => mouseDown(node, e)"/>
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
  //transition: all 0.2s ease-in-out, top 0s linear, left 0s linear, transform 0s linear;

  &.isShadow {
    background-color: rgba(0, 0, 0, 0.2);
    z-index: -1;
  }
}

</style>