<template>
  <button class="node"
          :style="{left: node.display.x + 'px', top: node.display.y + 'px', '--hue': node.display.hue}">
    {{ node.name }}
  </button>
</template>
<script lang="ts">
import {GraphNode} from "@/logic/node";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'GraphNodeButton',
  props: {
    node: {
      type: Object as () => GraphNode,
      required: true
    }
  }
}
)</script>

<style scoped lang="scss">
@import "@/scss/custom";

.node {
  position: absolute;
  border: none;
  border-radius: 2em;
  transform: translate(-50%, -50%);
  padding: .3em .7em;
  background-color: hsl(var(--hue), 88%, 50%);
  transition: all 0.2s ease-in-out, top 0s linear, left 0s linear;
  cursor: grab;
  box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.4);

  &:hover {
    box-shadow: 5px 5px 5px 1px rgba(0, 0, 0, 0.4);
    transform: translate(calc(-50% - 5px), calc(-50% - 5px));
  }

  &.dragging {
    // adding a black shadow when the button is being moved
    box-shadow: 12px 12px 10px 3px rgba(0, 0, 0, 0.4);
    transform: translate(calc(-50% - 10px), calc(-50% - 10px));
    cursor: grabbing;
  }
}
</style>