<script lang="ts">
import SingleStone from './SingleStone.vue';
import { defineComponent, reactive, PropType } from 'vue';

export default defineComponent({

  components: {
    SingleStone
  },
  props: {
    stones: Array<LegendStone.StoneMeta>
  },
  setup(props, context) {
    const stonesRefs = reactive(props.stones || [])

    const stonesCost: LegendStone.StoneCost[] = reactive([]);

    const onStoneCostChanged = (changedStone: LegendStone.StoneCost) => {
      const find = stonesCost.find(item => item.stone.name === changedStone.stone.name);
      if (find) {
        find.cost = changedStone.cost;
        find.gm = changedStone.gm;
      } else {
        stonesCost.push(changedStone);
      }
      context.emit('cost-changed', stonesCost)
    }

    const OnStoneDelete = (name: string) => {
      context.emit('stone-delete', name);
    }

    return {
      stonesRefs,
      onStoneCostChanged,
      OnStoneDelete
    }
  }
})

</script>
<template>
  <a-row v-for="(stone) in stonesRefs" :gutter="24">
    <a-col :span="24">
      <SingleStone :uri="stone.uri" :name="stone.name" @stone-cost-changed="onStoneCostChanged"
        @stone-delete="OnStoneDelete" />
    </a-col>
  </a-row>
</template>

<style scoped>

</style>