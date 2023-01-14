<script setup lang="ts">
import Stones from "./components/legend-stone/Stones.vue";
import StoneStaticstics from './components/legend-stone/StoneStaticstics.vue';
import { reactive, ref } from "vue";
import { message } from 'ant-design-vue';

const stones: LegendStone.StoneMeta[] = reactive([])
let stoneCost = ref<LegendStone.StoneCost[]>([])

const onAddStone = (stone: LegendStone.StoneMeta) => {
  if (stones.findIndex(one => one.name === stone.name) > -1) {
    message.error('已经添加了相同的宝石了');
    return;
  }
  stones.push(stone)
}

const onCostChanged = (stonesCost: LegendStone.StoneCost[]) => {
  stoneCost.value = stonesCost;
}

const onClearStone = () => {
  stones.splice(0, stones.length);
  stoneCost.value = []
}

const OnStoneDelete = (name: string) => {
  const index = stones.findIndex(one => one.name === name);
  if (index > -1) {
    stones.splice(index, 1);
  }
  const costIdx = stoneCost.value.findIndex(one => one.stone.name === name);
  if (costIdx > -1) {
    stoneCost.value.splice(costIdx, 1);
  }
}

</script>

<template>
  <div class="app-container">
    <div style="height: 80vh; overflow-y: auto; overflow-x: hidden;">
      <Stones :stones="stones" @cost-changed="onCostChanged" @stone-delete="OnStoneDelete" />
    </div>
    <div
      style="position: absolute;bottom: 0;left: 0;right: 0;height: 20vh;border-radius: 10px;box-shadow: 0px -6px 10px grey;">
      <StoneStaticstics @added-stone="onAddStone" :stone-cost="stoneCost" @clear-stone="onClearStone" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  border-radius: 10px;
  box-shadow: 0px -6px 10px grey;
}
</style>
