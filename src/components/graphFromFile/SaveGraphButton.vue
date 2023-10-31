<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from "@/logic/node";

export default defineComponent({
  name: "SaveGraphButton",
  props: {
    primary: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: "md"
    },
    graph: {
      type: Object as () => GraphNode | null,
      required: true
    }
  },
  methods: {
    saveGraph() {
      if (this.graph == null) return;
      const graphString = this.graph.graphToString();
      if (graphString == null) return;
      const blob = new Blob([graphString], {type: 'text/plain'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph.json';
      a.click();
      window.URL.revokeObjectURL(url);
    },
  }
})
</script>

<template>
  <button :class="`btn btn-${primary ? 'primary' : 'secondary'} btn-${size}`" @click="saveGraph" :disabled="graph == null">
    Save Graph
  </button>
</template>

<style scoped lang="scss">
@import "@/scss/custom";
</style>