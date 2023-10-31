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
      (this.$refs["file-input"] as HTMLInputElement).click();
    },
    fileChosen(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file == null) return;
      const reader = new FileReader();
      reader.onload = e => {
        const graph = GraphNode.graphFromString(e.target?.result as string);
        this.$emit('onGraphLoaded', graph);
      }
      reader.readAsText(file);
    },
  }
})
</script>

<template>
  <button @click="loadGraph" :class="`btn btn-${primary ? 'primary' : 'secondary'} btn-${size}`">
    <input type="file" accept=".json" ref="file-input" @change="fileChosen" hidden/>
    Load Graph
  </button>
</template>

<style scoped lang="scss">
@import "@/scss/custom";
</style>