<template>
  <div
    :class="
      cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        ($attrs.class as ClassValue)
      )
    "
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "~/utils";
import type { ClassValue } from "clsx";
</script>
