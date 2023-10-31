<template>
  <button class="node" :class="{'is-start': isStart}"
          :style="{left: node.display.x + 'px', top: node.display.y + 'px', '--hue': node.display.hue}">

    <span @input="e => $emit('update:name', e)"
          @focusout="e => $emit('spanfocusout', e)" contenteditable>{{ node.name }}</span>
  </button>
</template>

<script lang="ts">
import {GraphNode} from "@/logic/node";
import {defineComponent} from "vue";
import gsap from "gsap";
import GSAPTween from "gsap/gsap-core";

export default defineComponent({
      name: 'GraphNodeButton',
      props: {
        node: {
          type: Object as () => GraphNode,
          required: true
        },
        isRoot: {
          type: Boolean,
          default: false
        },
        isStart: {
          type: Boolean,
          default: false
        },
      },
      emits: {
        'update:name': (e: Event) => true,
        'spanfocusout': (e: Event) => true,
      }
    }
)</script>

<style scoped lang="scss">
@import "@/scss/custom";

.node {
  position: absolute;
  border: none;
  border-radius: 2em;
  transform: translate(-50%, -50%);
  padding: .4em .5em;
  background-color: hsl(var(--hue), 88%, 50%);
  transition: all 0.2s ease-in-out, top 0s linear, left 0s linear;
  cursor: grab;
  box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.4);

  &:nth-child(1) {
    border-radius: 3px;
  }

  span {
    font-family: 'Bree Serif', serif;
    border: none;
    background-color: transparent;
    border-radius: 3px;
    color: white;
    padding: .1em .35em;
    transition: all 0.2s ease-in-out;

    &:hover {
      box-shadow: white 0 0 1px 1px inset;

    }

    &:focus {
      box-shadow: white 0 0 2px 2px inset;
      outline: none;
    }
  }

  &:hover {
    box-shadow: 5px 5px 5px 1px rgba(0, 0, 0, 0.4);
    transform: translate(calc(-50% - 5px), calc(-50% - 5px));
  }

  &.dragging {
    // adding a black shadow when the button is being moved
    box-shadow: 12px 12px 10px 3px rgba(0, 0, 0, 0.4);
    transform: translate(calc(-50% - 10px), calc(-50% - 10px));
    cursor: grabbing;
  }

  &.is-start:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: inherit;
    animation: cool-selected 2s infinite linear;
  }
}

@keyframes cool-selected {
  0% {
    box-shadow: 0 0 0 0 hsla(var(--hue), 88%, 50%, 50%), 0 0 0 8px hsla(var(--hue), 88%, 50%, 33%), 0 0 0 16px hsla(var(--hue), 88%, 50%, 17%);
  }
  100% {
    box-shadow: 0 0 0 8px hsla(var(--hue), 88%, 50%, 33%), 0 0 0 16px hsla(var(--hue), 88%, 50%, 17%), 0 0 0 24px hsla(var(--hue), 88%, 50%, 0%);
  }
}
</style>