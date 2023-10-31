<template>
  <nav class="navbar bg-light">
    <div class="container-fluid">
      <div class="navbar-brand">
        <img alt="Logo" class="mx-3" height="27" src="@/assets/logo.png" width="27">
        <span>Dijkstra</span>
      </div>
      <LoadGraphButton class="mx-1" @onGraphLoaded="graph1 => graph = graph1" size="sm"/>
      <SaveGraphButton class="mx-1" size="sm" :graph="graph"/>
      <div class="form-check mx-3">
        <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" v-model="linkNodes">
        <label class="form-check-label" for="flexCheckChecked">
          Link nodes
        </label>
      </div>
      <div class="text-secondary ms-auto">
        Made by <a class="git-profile-link text-secondary" href="https://github.com/bananasmoothii">Bananasmoothii</a>
        <a href="https://github.com/bananasmoothii/dijkstra">
          <img alt="GitHub" class="mx-3" height="27.2" src="@/assets/github-mark.svg" width="27.2">
        </a>
      </div>
    </div>
  </nav>
  <NodeGroup v-if="graph" :graph="graph" :link-nodes-mode="linkNodes"/>
  <div v-else class="text-center">
    <h1 class="display-1 mt-5">Dijkstra</h1>
    <p class="lead">A simple Dijkstra's algorithm implementation with a nice interface</p>
    <p>
      <LoadGraphButton @onGraphLoaded="graph1 => graph = graph1" primary size="lg" class="mx-3"/>
      <NewGraphButton @onNewGraph="graph1 => graph = graph1" classes="btn-lg btn-secondary mx-3"/>
    </p>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import LoadGraphButton from "@/components/graphFromFile/LoadGraphButton.vue";
import NodeGroup from "@/components/NodeGroup.vue";
import {GraphNode} from "@/logic/node";
import SaveGraphButton from "@/components/graphFromFile/SaveGraphButton.vue";
import NewGraphButton from "@/components/graphFromFile/NewGraphButton.vue";

export default defineComponent({
  name: 'App',
  components: {
    NewGraphButton,
    SaveGraphButton,
    NodeGroup,
    LoadGraphButton
  },
  data(): { graph: GraphNode | null, linkNodes: boolean } {
    return {
      graph: null,
      linkNodes: false,
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
