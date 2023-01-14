<script lang="ts">
import { AntDesignOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { defineComponent, ref, reactive, watch, computed } from "vue";
import StoneData from './stone.data.json'

interface CalcProcess {
  title: String,
  process: Array<String>
}

interface LvFuncMapping {
  [key: number]: Function
}

interface StoneLvGm {
  [key: string]: number
}

interface StoneGmData {
  [key: string]: StoneLvGm
}

export default defineComponent({
  components: {
    AntDesignOutlined,
    CloseOutlined
  },
  props: {
    uri: {
      type: String
    },
    name: {
      type: String
    }
  },
  setup(props, context) {

    const formData = reactive({
      // 本体星数
      startAmount: 2,
      // 宝石能量价格
      updatePricePerOne: 100,
      // 本体价格
      stoneCost: 32000,
      // 二星本体价格
      twoMyselfPrice: 32000,
      // 期望级数
      updateToLevel: 2,
      // 当前等级
      currentLevel: -1,
      isLvUpCurrentStar: false,
      // 人民币预算
      rmbBudget: 0,
      budgetType: 'no',
      uri: props.uri,
      name: props.name
    })

    const lvUpCost = ref(0);
    const fromCurr2LvUpCost = ref(0);
    const costRmb = ref(0);
    // 共鸣
    const gmData: StoneGmData = StoneData.gm;
    const stoneGm = computed(() => gmData[formData.startAmount + ''][formData.updateToLevel + ''])
    watch(lvUpCost, (value) => {
      context.emit('stone-cost-changed', { stone: { name: props.name, uri: props.uri }, cost: value, gm: stoneGm, still: fromCurr2LvUpCost })
    });
    watch(() => formData.budgetType, () => {
      if (formData.budgetType === 'no') {
        formData.rmbBudget = 0;
      }
    })

    const calcProcess: CalcProcess = reactive({
      title: formData.updateToLevel < 2 ? '升级过程' : `升级到lv${formData.updateToLevel}计算过程`,
      process: []
    });

    const onConditionChanged = () => {

      if (!formData.startAmount ||
        !formData.stoneCost ||
        !formData.updatePricePerOne ||
        !formData.twoMyselfPrice ||
        formData.updateToLevel < 2) {
        return;
      }
      calcProcess.title = `升级到lv${formData.updateToLevel}计算过程`;
      calcProcess.process = [];
      lvUpCost.value = calcTotal(true, formData.updateToLevel);
      if (formData.currentLevel > formData.updateToLevel) {
        formData.currentLevel = formData.updateToLevel;
        fromCurr2LvUpCost.value = 0;
        return;
      }
      const toCurrentLv = calcTotal(false, formData.currentLevel);
      fromCurr2LvUpCost.value = lvUpCost.value - toCurrentLv;
      if (formData.isLvUpCurrentStar || formData.currentLevel === -1) {
        fromCurr2LvUpCost.value += formData.stoneCost;
      }
    };

    const calcTotal = (addProcessDesc: boolean = true, updateToLevel: number = 2) => {

      const myself = formData.stoneCost;

      const lvUp2 = (addProcessDesc = true) => {
        const myselfLvUpEnerge = 50 * formData.updatePricePerOne;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到2级, 能量成本: 50 * ${formData.updatePricePerOne} = ${myselfLvUpEnerge}白金币`
          );
        }
        return myselfLvUpEnerge;
      };

      const lvUp3 = (addProcessDesc = true) => {
        const myselfLvUpEnerge = 75 * formData.updatePricePerOne;
        const myselfOne = formData.twoMyselfPrice;
        const totalCost = myselfLvUpEnerge + myselfOne;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到3级, 能量成本: 75 * ${formData.updatePricePerOne} = ${myselfLvUpEnerge}白金币, 1个本体: ${myselfOne}白金币, 总计: ${totalCost}`
          );
        }
        return totalCost;
      };

      const lvUp4 = (addProcessDesc = true) => {
        const myselfLvUpEnerge = 100 * formData.updatePricePerOne;
        const myselfOne = formData.twoMyselfPrice;
        const totalCost = myselfLvUpEnerge + myselfOne;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到4级, 能量成本: 100 * ${formData.updatePricePerOne} = ${myselfLvUpEnerge}白金币, 1个本体: ${myselfOne}白金币, 总计: ${totalCost}`
          );
        }
        return totalCost;
      };

      const lvUp5 = (addProcessDesc = true) => {
        const lv1Cost = formData.twoMyselfPrice;
        // 1个石头升到3级
        const lv3Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false);
        const totalCost = lv3Cost * 2 + lv1Cost;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到5级, 需要1个1级本体, 2个3级本体, 成本: ${lv1Cost}(1级本体) + ${lv3Cost} * 2(三级本体) , 总计: ${totalCost}白金币`
          );
        }
        return totalCost;
      };

      const lvUp6 = (addProcessDesc = true) => {
        const lv3Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false);
        const totalCost = lv3Cost * 3;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到6级, 需要3个3级本体, 成本: ${lv3Cost} * 3(三级本体), 总计: ${totalCost}白金币`
          );
        }
        return totalCost;
      };

      const lvUp7or8 = (addProcessDesc = true, lv = 7) => {
        const lv3Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false);
        // 1个石头升到5级
        const lv5Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false) + lvUp4(false) + lvUp5(false);
        const totalCost = lv3Cost * 2 + lv5Cost;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到${lv}级, 需要2个3级本体, 1个5级本体, 成本: ${lv3Cost} * 2(三级本体) + ${lv5Cost}(五级本体) , 总计: ${totalCost}白金币`
          );
        }
        return totalCost;
      };

      const lvUp8 = (addProcessDesc = true) => {
        return lvUp7or8(addProcessDesc, 8);
      };

      const lvUp9or10 = (addProcessDesc = true, lv = 9) => {
        const lv3Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false);
        // 1个石头升到5级
        const lv5Cost = formData.twoMyselfPrice + lvUp2(false) + lvUp3(false) + lvUp4(false) + lvUp5(false);
        const totalCost = lv3Cost * 1 + lv5Cost * 2;
        if (addProcessDesc) {
          calcProcess.process.push(
            `升到${lv}级, 需要1个3级本体, 2个5级本体, 成本: ${lv3Cost} (三级本体) + ${lv5Cost}* 2(五级本体) , 总计: ${totalCost}白金币`
          );
        }
        return totalCost;
      };

      const lvUp10 = (addProcessDesc = true) => {
        return lvUp9or10(addProcessDesc, 10);
      };

      const lvMapping: LvFuncMapping = {
        2: lvUp2,
        3: lvUp3,
        4: lvUp4,
        5: lvUp5,
        6: lvUp6,
        7: lvUp7or8,
        8: lvUp8,
        9: lvUp9or10,
        10: lvUp10
      };

      let totalCost = myself;
      for (let index = 2; index <= updateToLevel; index++) {
        const func = lvMapping[index];
        totalCost += func(addProcessDesc)
      }
      if (addProcessDesc) {
        calcProcess.process.push(
          `升到${updateToLevel}级, 总计: ${totalCost}白金币`
        );
      }
      return totalCost;
    }

    // 默认计算一次
    lvUpCost.value = calcTotal();

    const onStoneDelete = () => {
      context.emit('stone-delete', props.name);
    }

    return {
      formData,
      lvUpCost,
      fromCurr2LvUpCost,
      calcProcess,
      stoneGm,
      costRmb,
      onConditionChanged,
      onStoneDelete
    }
  }
});

</script>

<template>
  <div class="legend-stone-card-container">
    <a-layout>
      <a-layout>
        <a-layout-content>
          <a-col :push="22"><a-button type="link" @click="onStoneDelete"><template #icon>
                <CloseOutlined />
              </template>删除</a-button></a-col>
          <div class="form-container">
            <a-form ref="conditionFormRef" name="singleLegendStone" :model="formData">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item name="lsStarAmount" label="宝石星数">
                    <a-select ref="startAmountSelect" v-model:value="formData.startAmount" @change="onConditionChanged">
                      <a-select-option :value="2">二星</a-select-option>
                      <a-select-option :value="3">三星</a-select-option>
                      <a-select-option :value="4">四星</a-select-option>
                      <a-select-option :value="5">满星</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item name="lsPrice" label="宝石价格">
                    <a-input-number v-model:value="formData.stoneCost" :step="100" style="width: 100%;" :min="0"
                      @change="onConditionChanged"></a-input-number>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item name="lsLvUp1Cost" label="宝石能量价格">
                    <a-input-number v-model:value="formData.updatePricePerOne" :step="100" style="width: 100%;" :min="0"
                      @change="onConditionChanged"></a-input-number>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item name="lsTwoMyselfPrice" label="二星本体价格">
                    <a-input-number v-model:value="formData.twoMyselfPrice" :step="100" style="width: 100%;" :min="0"
                      @change="onConditionChanged"></a-input-number>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item name="lsUpdateToLevel" label="期望等级">
                    <a-select ref="updateToLevel" v-model:value="formData.updateToLevel" @change="onConditionChanged">
                      <a-select-option v-for="(level) in 9" :value="level + 1">lv{{ level + 1}}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :push="10">
                  <a-avatar :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }">
                    <template #icon>
                      <a-image :src="uri" />
                    </template>
                  </a-avatar>
                </a-col>
              </a-row>
              <a-divider />
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item name="lsCurrentLevel" label="当前等级">
                    <a-select v-model:value="formData.currentLevel" @change="onConditionChanged">
                      <a-select-option :value="-1">我还没有石头</a-select-option>
                      <a-select-option v-for="(level) in formData.updateToLevel" :value="level">lv{{
                        level
                      }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item name="lslvUpCurrentStar" label="是否升级到当前星数">
                    <a-switch v-model:checked="formData.isLvUpCurrentStar" @change="onConditionChanged"></a-switch>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item name="lsRmbBudget" label="预算（人民币）">
                    <a-input-number v-model:value="formData.rmbBudget" :step="100" style="width: 100%;" :min="0"
                      @change="onConditionChanged"></a-input-number>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="预算使用方式">
                    <a-radio-group v-model:value="formData.budgetType" @change="onConditionChanged">
                      <a-radio-button value="no">零氪</a-radio-button>
                      <a-radio-button value="a">月礼包(328)</a-radio-button>
                      <a-radio-button value="b"><a-tooltip>
                          <template #title>尽量买月礼包, 剩下的预算充值1298(会送3000)</template>
                        </a-tooltip>
                        月礼包+1298</a-radio-button>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-layout-content>
        <a-divider />
        <a-layout-footer>
          <a-row :gutter="24">
            <a-col :span="14">
              <a-card :title="calcProcess.title">
                <p v-for="(desc, index) in calcProcess.process">{{ (index + 1) + '. ' + desc }}</p>
              </a-card>
            </a-col>
            <a-col :span="10">
              <a-row>
                <a-col :span="8">
                  <h4 style="color:dimgray;margin-left: 15px;">名称</h4>
                  <h3 style="margin-left: 15px;"><strong>{{ name }}</strong></h3>
                </a-col>
                <a-col :span="8">
                  <a-statistic title="花费(白金币)" :value="lvUpCost" style="margin-left: 15px;" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="还需花费" :value="fromCurr2LvUpCost" style="margin-left: 15px;" />
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="8">
                  <a-statistic title="共鸣" :value="stoneGm" style="margin-left: 15px;" />
                </a-col>
                <a-col :span="8">
                  <a-statistic title="花费（人民币）" :value="costRmb" style="margin-left: 15px;" />
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<style lang="css" scoped>
.legend-stone-card-container {
  padding: 5vh;
  font-size: 14px;
  margin-bottom: 10px;
}

.form-container {
  padding: 2vh;
}
</style>