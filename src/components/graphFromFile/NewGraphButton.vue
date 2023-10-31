<script lang="ts">
import {defineComponent} from 'vue'
import {GraphNode} from "@/logic/node";

export default defineComponent({
  name: "NewGraphButton",
  props: {
    primary: {
      type: Boolean,
      default: false
    },
    classes: {
      type: String,
      default: "btn-secondary btn-md"
    }
  },
  emits: {
    onNewGraph: (graph: GraphNode) => true
  },
  methods: {
    newGraph() {
      let a = new GraphNode("A1");
      let b = new GraphNode("B1");
      let c = new GraphNode("C1");
      a.linkTo(b, 1);
      b.linkTo(c, 1);
      c.linkTo(a, 1);
      this.$emit('onNewGraph', a);
    },
  }
})
</script>

<template>
  <button class="btn" :class="classes" @click="newGraph">
    New Graph
  </button>
</template>

<style scoped lang="scss">
@import "@/scss/custom";
</style>