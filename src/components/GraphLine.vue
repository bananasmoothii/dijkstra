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
    <div v-if="line.base.path" class="line-dot" :class="{...classes, animate: this.animate}" v-show="animate">
    </div>
    <div v-if="line.base.path" class="dot-boom small" :class="{...classes, animate: this.animateBoom}">
    </div>
    <div v-if="line.base.path" class="dot-boom big" :class="{...classes, animate: this.animateBoom}">
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
import {defineComponent, nextTick} from "vue";

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
      animateBoom: false,
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
          this.timeouts.push(setTimeout(() => {
            this.animations();
          }, 750 * path!.elementInChain));
        }
      }
    },
    animate(current, previous) {
      if (current && !previous) {
        this.animateBoom = false;
        setTimeout(() => {
          this.animateBoom = true;
        }, 50);
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
        'to-right': path.indicator === PathIndicator.ToNode1,
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
    animations() {
      this.animate = true;
      this.timeouts.push(setTimeout(() => {
        this.animate = false;
        if (this.line.base.path === undefined) return;
        this.timeouts.push(setTimeout(() => {
          this.animations();
        }, Math.min(750 * (this.line.base.path.chainLength - 1), 1100)));
      }, 750));
    }
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
  animation-iteration-count: 1;
  animation-duration: 750ms;
  box-shadow: 0 0 3px 3px #0004 inset; // , 0 0 0 8px white;

  &.animate {
    &.to-left {
      animation-name: dot-whoosh-to-left;
    }

    &.to-right {
      animation-name: dot-whoosh-to-right;
    }
  }

  // eyes
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    border-radius: 100px;
    width: 2px;
    height: 2px;
    background-color: black;
    outline: white 2.5px solid;
  }

  &::before {
    transform: translateY(calc(3px - 50%));
  }

  &::after {
    transform: translateY(calc(-3px - 50%));
  }

  &.to-left::before, &.to-left::after {
    left: 6px;
  }

  &.to-right::before, &.to-right::after {
    right: 6px;
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

.dot-boom {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1000px;
  width: 0;
  height: 0;
  background-color: transparent;
  outline: #fff solid 5px;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-duration: 1s;
  animation-delay: 100ms;

  &.animate {
    animation-name: dot-boom;
  }

  &.to-left {
    left: 0;
  }

  &.to-right {
    left: 100%;
  }

  &.big {
    animation-delay: 200ms;
  }
}

@keyframes dot-boom {
  0% {
    width: 0;
    height: 0;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0.5;
    outline-width: 0;
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