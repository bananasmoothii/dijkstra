<template>
  <div class="line"
       :style="{
        left: line.center.x + 'px',
        top: line.center.y + 'px',
        width: line.length + 'px',
        height: lineHeight + 'px',
        transform: `rotate(${line.angle}rad)`,
        '--hue': line.base.hue,
  }">
  </div>
  <span :style="{left: line.center.x + line.length / 2 + 'px', top: line.center.y + 'px'}"
        ref="span" @focusout="validateInput" @keydown.enter.prevent="validateInput" contenteditable>{{ formattedWeight }}</span>
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
  emits: {
    'update:weight': (newWeight: number) => true,
  },
  computed: {
    formattedWeight: {
      get(): string {
        let weight = this.line.base.graphWeight;
        if (weight == Infinity) return '∞';
        return weight.toString();
      },
      set(value: string) {
        if (value == '∞') value = 'Infinity';
        let weight = parseFloat(value);
        if (isNaN(weight)) {
          let span = this.$refs.span as HTMLSpanElement;
          span.innerText = this.formattedWeight;
          return;
        }
        this.$emit('update:weight', weight);
      }
    },
    lineHeight(): number {
      if (this.line.base.graphWeight == Infinity) return 2;
      return Math.log2(this.line.base.graphWeight);
    }
  },
  methods: {
    validateInput(e: Event) {
      this.formattedWeight = (e.target as HTMLSpanElement).innerText;
      (document.activeElement as HTMLElement)?.blur();
    },
  }
})
</script>
<style scoped lang="scss">
@import "@/scss/custom";

.line {
  position: absolute;
  border-radius: 1px;
  padding: 0;
  margin: 0;
  line-height: 1px;
  background-color: hsl(var(--hue), 88%, 50%);
}

span {
  transform: translate(.8em, .8em);
  position: absolute;
  display: inline-block;
  margin: 0 auto;
  border: none;
  background-color: transparent;
  border-radius: 3px;
  color: black;
  padding: .1em .3em;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: black 0 0 1px 1px inset;
  }

  &:focus {
    box-shadow: black 0 0 2px 2px inset;
    outline: none;
  }
}
</style>