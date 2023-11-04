<template>
  <div class="line"
       :class="classes"
       :style="{
        left: line.center.x + 'px',
        top: line.center.y + 'px',
        width: line.length + 'px',
        height: lineHeight + 'px',
        transform: `translateY(${-lineHeight / 2}px) rotate(${line.angle}rad)`,
        '--start-hue': line.base.startHue,
        '--end-hue': line.base.endHue,
  }">
    <div v-if="line.base.path" class="line-dot" :class="{...classes, 'animate': animate}" v-show="animate">
    </div>
  </div>
  <span v-if="!noweight" :style="{left: line.center.x + line.length / 2 + 'px', top: line.center.y + 'px'}"
        ref="span" @focusout="validateInput" @keydown.enter.prevent="validateInput" contenteditable>
    {{ formattedWeight }}
  </span>
</template>
<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Line, PathIndicator} from "@/components/NodeGroup.vue";
import {defineComponent} from "vue";

export default defineComponent({
  name: 'GraphLine',
  props: {
    line: {
      type: Object as () => Line,
      required: true
    },
    noweight: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      timeouts: [] as number[],
      animate: false,
    }
  },
  emits: {
    'update:weight': (newWeight: number) => true,
  },
  watch: {
    "line.base.path": {
      immediate: true,
      handler() {
        let path = this.line.base.path;
        this.animate = false;
        for (let timeout of this.timeouts) {
          clearTimeout(timeout);
        }
        this.timeouts = [];
        if (path !== undefined) {
          // eslint-disable-next-line no-inner-declarations
          const animateF = () => {
            this.animate = true;
            this.timeouts.push(setTimeout(() => {
              this.animate = false;
              this.timeouts.push(setTimeout(() => {
                animateF();
              }, Math.min(500 * (path!.chainLength - 1), 1100)));
            }, 500));
          }
          this.timeouts.push(setTimeout(() => {
            animateF();
          }, 500 * path!.elementInChain));
        }
      }
    }
  },
  computed: {
    classes() {
      let path = this.line.base.path;
      if (!path) return {};
      return {
        'path-indicator': true,
        'to-left': path.indicator === PathIndicator.ToNode2,
        'to-right': path.indicator === PathIndicator.ToNode1
      }
    },
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
      if (this.line.base.graphWeight == Infinity || this.noweight) return 2;
      const height = Math.sqrt(this.line.base.graphWeight / 10);
      if (height <= 2) return 2;
      return height;
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
  border-radius: 100px;
  padding: 0;
  margin: 0;
  line-height: 1px;
  background: linear-gradient(in oklch shorter hue -90deg, hsl(var(--start-hue), 88%, 50%) 10%, hsl(var(--end-hue), 88%, 50%) 90%);

  &.path-indicator {
    box-shadow: 0 0 0 10px white;
  }
}

.line-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 100px;
  width: 14px;
  height: 14px;
  background-color: hsl(200, 88%, 50%);
  animation-timing-function: cubic-bezier(0.59, 0.26, 0.31, 0.99);
  animation-iteration-count: infinite;
  animation-duration: 500ms;
  box-shadow: 0 0 5px 3px #0002 inset;// , 0 0 0 8px white;

  &.animate {
    &.to-left {
      animation-name: dot-whoosh-to-left;
    }

    &.to-right {
      animation-name: dot-whoosh-to-right;
    }
  }
}

@keyframes dot-whoosh-to-left {
  0% {
    left: 100%;
  }
  60% {
    width: 30%;
  }
  78% {
  }
  100% {
    left: 0;
  }
}

@keyframes dot-whoosh-to-right {
  0% {
    left: 0;
  }
  60% {
    width: 30%;
  }
  78% {
  }
  100% {
    left: 100%;
  }
}

span {
  transform: translate(calc(-50% + .8em), calc(-50% - .8em));
  position: absolute;
  display: inline-block;
  margin: 0 auto;
  border: none;
  background-color: transparent;
  border-radius: 3px;
  color: black;
  padding: .1em .3em;
  transition: all 0.2s ease-in-out;
  z-index: 10;

  &:hover {
    box-shadow: black 0 0 1px 1px inset;
  }

  &:focus {
    box-shadow: black 0 0 2px 2px inset;
    outline: none;
  }
}
</style>