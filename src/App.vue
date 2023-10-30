<template>
  <nav class="navbar bg-light">
    <div class="container-fluid">
      <div class="navbar-brand">
        <img alt="Logo" class="mx-3" height="27" src="@/assets/logo.png" width="27">
        <span>Dijkstra</span>
      </div>
      <LoadGraphButton @onGraphLoaded="(graph1) => graph = graph1"/>
      <div class="text-secondary ms-auto">
        Made by <a class="git-profile-link text-secondary" href="https://github.com/bananasmoothii">Bananasmoothii</a>
        <a href="https://github.com/bananasmoothii/dijkstra">
          <img alt="GitHub" class="mx-3" height="27.2" src="@/assets/github-mark.svg" width="27.2">
        </a>
      </div>
    </div>
  </nav>
  <NodeGroup :graph="graph"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LoadGraphButton from "@/components/graphFromFile/LoadGraphButton.vue";
import NodeGroup from "@/components/NodeGroup.vue";
import {GraphNode} from "@/logic/node";

export default defineComponent({
  name: 'App',
  components: {
    NodeGroup,
    LoadGraphButton
  },
  data(): { graph: GraphNode | null } {
    return {
      graph: null
    }
  },
});
</script>

<style lang="scss">
@import "@/scss/custom";

.git-profile-link {
  text-decoration: underline;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #000 !important;
  }
}
</style>
