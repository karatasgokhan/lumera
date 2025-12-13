<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="
      cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
        modelValue ? 'bg-green-600' : 'bg-gray-200'
      )
    "
    @click="toggle"
  >
    <span
      :class="
        cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        )
      "
    />
  </button>
</template>

<script setup lang="ts">
import { cn } from "~/utils";

interface Props {
  modelValue: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const toggle = () => {
  if (!props.disabled) {
    emit("update:modelValue", !props.modelValue);
  }
};
</script>
