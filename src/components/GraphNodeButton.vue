<template>
  <button v-for="node in nodes" :key="node" class="node"
          :style="{left: node.display.x + 'px', top: node.display.y + 'px', '--hue': node.display.hue}">
    {{ node.name }}
  </button>
</template>
<script lang="ts">
import {GraphNode} from "@/logic/node";

export default {
  name: 'GraphNodeButton',
  props: {
    nodes: Array as () => GraphNode[]
  }
}
</script>

<style scoped lang="scss">
@import "@/scss/custom";

.node {
  position: absolute;
  border: none;
  border-radius: 2em;
  transform: translate(-50%, -50%);
  padding: .3em .7em;
  background-color: hsl(var(--hue), 88%, 50%);
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 0 0 0.25em hsl(var(--hue), 100%, 95%);
  }
}
</style>