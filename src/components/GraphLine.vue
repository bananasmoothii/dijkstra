<template>
  <div
      :style="{left: line.center.x + 'px', top: line.center.y + 'px', width: line.length + 'px', transform: `rotate(${line.angle}rad)`, '--hue': line.hue}">
    <p :style="{transform: `rotate(${-line.angle}rad) translate(.8em, -.8em)`}">{{ formattedWeight }}</p>
  </div>
</template>
<script lang="ts">
import {Line} from "@/components/NodeGroup.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'GraphLine',
  props: {
    line: {
      type: Object as () => Line,
      required: true
    }
  },
  computed: {
    formattedWeight(): string {
      let weight = this.line.graphWeight;
      if (weight == Infinity) return '∞';
      return weight.toString();
    },
  },
})
</script>
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
}

p {
  text-align: center;
}

</style>