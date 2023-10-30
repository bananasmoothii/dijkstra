<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from "@/logic/node";

export default defineComponent({
  name: "LoadGraphButton",
  props: {
    primary: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: "md"
    }
  },
  emits: {
    onGraphLoaded: (graph: GraphNode) => true
  },
  methods: {
    loadGraph() {
      // TODO: Load graph from file
      const a = new GraphNode("AAAAAAAAAAAAAA");
      const b = new GraphNode("B");
      const c = new GraphNode("C");
      a.infiniteLinkTo(b);
      b.infiniteLinkTo(c);
      this.$emit("onGraphLoaded", a);
    }

  }
})
</script>

<template>
  <button @click="loadGraph" :class="`btn btn-${primary ? 'primary' : 'secondary'} btn-${size}`">
    Load Graph
  </button>
</template>

<style scoped lang="scss">
@import "@/scss/custom";
</style>