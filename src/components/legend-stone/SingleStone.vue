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

interface BuyView {
  xz: number,
  yk: number,
  ylb: number,
  zlb: number,
  srlb: number,
  total: number,
  untradeableKeys: number,
  rest: number,
  tradeableKeys: string | undefined
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
      // 预算使用时间
      budgetUseMonths: 1,
      // 已有能量
      hasEnergy: 0,
      uri: props.uri,
      name: props.name
    })

    const buyView: BuyView = reactive<BuyView>({
      xz: 0,
      yk: 0,
      ylb: 0,
      zlb: 0,
      srlb: 0,
      total: 0,
      untradeableKeys: 0,
      rest: 0,
      tradeableKeys: undefined
    })

    const lvUpCost = ref(0);
    const fromCurr2LvUpCost = ref(0);
    // 共鸣
    const gmData: StoneGmData = StoneData.gm;
    const stoneGm = computed(() => gmData[formData.startAmount + ''][formData.updateToLevel + ''])
    watch(lvUpCost, (value) => {
      context.emit('stone-cost-changed', { stone: { name: props.name, uri: props.uri }, cost: value, gm: stoneGm, still: fromCurr2LvUpCost })
    });


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
      fromCurr2LvUpCost.value = lvUpCost.value - toCurrentLv - formData.hasEnergy * formData.updatePricePerOne;
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

    const onCalcBudgetUseType = () => {

      interface CalcFactor {
        xz: number,
        yk: number,
        ylb: number,
        zlb: number,
        srlb: number
      }

      interface TradeableKey {
        t1298: number,
        t648: number,
        t328: number,
        t198: number,
        t98: number,
        t30: number,
        t6: number,
        totalKeys: number
      }

      const xzCost = 30;
      const ykCost = 68;
      const ylbCost = 328;
      const zlbCost = 68;
      const srlbCost = 40;
      const budgetUseMonths = formData.budgetUseMonths || 1;
      // 先祖最大数量
      const xzCnt = budgetUseMonths;
      // 月卡最大数量
      const ykCnt = budgetUseMonths;
      // 月礼包最大数量
      const ylbCnt = budgetUseMonths;
      // 周礼包最大数量
      const zlbCnt = budgetUseMonths * 4;
      // 三日礼包最大数量
      const srCnt = budgetUseMonths * 16;
      const maxCnt = Math.max(xzCnt, ykCnt, ylbCnt, zlbCnt, srCnt);

      const calcEachTypeKeys = (factor: CalcFactor): number => {
        return factor.xz * 3 + factor.yk * 7 + factor.ylb * 30 + factor.zlb * 6 + factor.srlb * 3;
      }
      const calcEachTypeCost = (factor: CalcFactor): number => {
        return factor.xz * xzCost + factor.yk * ykCost + factor.ylb * ylbCost + factor.zlb * zlbCost + factor.srlb * srlbCost;
      }
      const calcBudgetNoOverflow = (factor: CalcFactor, currBudget: number): boolean => {
        return calcEachTypeCost(factor) <= currBudget;
      }
      // 计算闪光不朽钥石购买档次数量
      const calcTradeableCount = (cost: number): TradeableKey => {

        const getCost = (cost: number, minus: number) => {
          return cost - minus > 0 ? cost - minus : 0;
        }

        let calcCost = cost;
        const t1298Cnt = Math.floor(calcCost / 1298);
        if (calcCost - t1298Cnt * 1298 > 0) {
          calcCost = calcCost - t1298Cnt * 1298;
        }
        const t648Cnt = Math.floor(calcCost / 648);
        if (calcCost - t648Cnt * 648 > 0) {
          calcCost = calcCost - t648Cnt * 648;
        }
        const t328Cnt = Math.floor(calcCost / 328);
        if (calcCost - t328Cnt * 328 > 0) {
          calcCost = calcCost - t328Cnt * 328;
        }
        const t198Cnt = Math.floor(calcCost / 198);
        if (calcCost - t198Cnt * 198 > 0) {
          calcCost = calcCost - t198Cnt * 198;
        }
        const t98Cnt = Math.floor(calcCost / 98);
        if (calcCost - t98Cnt * 98 > 0) {
          calcCost = calcCost - t98Cnt * 98;
        }
        const t30Cnt = Math.floor(calcCost / 30);
        if (calcCost - t30Cnt * 30 > 0) {
          calcCost = calcCost - t30Cnt * 30;
        }
        const t6Cnt = Math.floor(calcCost / 6);

        const totalKeys = Math.floor(
          (t1298Cnt * (12980 + 3000) + t648Cnt * (6480 + 1288) + t328Cnt * (3280 + 588) + t198Cnt * (1980 + 298) + t98Cnt * (980 + 128) + t30Cnt * (300 + 30) + t6Cnt * 60)
          / 160
        );
        return {
          t1298: t1298Cnt,
          t648: t648Cnt,
          t328: t328Cnt,
          t198: t198Cnt,
          t98: t98Cnt,
          t30: t30Cnt,
          t6: t6Cnt,
          totalKeys: totalKeys
        };
      }
      // 按性价比计算，月卡>先祖>月礼包>周礼包>三日礼包，因此最先满足性价比高的
      let budgetRest = formData.rmbBudget;
      const canBuyAny = (factor: CalcFactor, budget: number) => {
        if (budget < 30) {
          return false;
        }
        return factor.xz < xzCnt || factor.yk < ykCnt || factor.ylb < ykCnt || factor.zlb < zlbCnt || factor.srlb < srCnt;
      }
      const calcFactor: CalcFactor = {
        xz: 0,
        yk: 0,
        ylb: 0,
        zlb: 0,
        srlb: 0
      };

      while (canBuyAny(calcFactor, budgetRest)) {
        let cantBuyAny = 0;
        calcFactor.yk++;
        if (calcFactor.yk <= ykCnt && budgetRest - ykCost > 0) {
          budgetRest -= ykCost;
          continue;
        } else {
          cantBuyAny++;
          calcFactor.yk--;
        }
        calcFactor.xz++;
        if (calcFactor.xz <= xzCnt && budgetRest - xzCost > 0) {
          budgetRest -= xzCost;
          continue;
        } else {
          cantBuyAny++;
          calcFactor.xz--;
        }
        calcFactor.ylb++;
        if (calcFactor.ylb <= ylbCnt && budgetRest - ylbCost > 0) {
          budgetRest -= ylbCost;
          continue;
        } else {
          cantBuyAny++;
          calcFactor.ylb--;
        }
        calcFactor.zlb++;
        if (calcFactor.zlb <= zlbCnt && budgetRest - zlbCost > 0) {
          budgetRest -= zlbCost;
          continue;
        } else {
          cantBuyAny++;
          calcFactor.zlb--;
        }
        calcFactor.srlb++;
        if (calcFactor.srlb <= srCnt && budgetRest - srlbCost > 0) {
          budgetRest -= srlbCost;
          continue;
        } else {
          cantBuyAny++;
          calcFactor.srlb--;
        }
        if (cantBuyAny === 5) {
          // 一个都没法买
          break;
        }
      }
      const tradeableKeys = calcTradeableCount(budgetRest);
      buyView.xz = calcFactor.xz;
      buyView.yk = calcFactor.yk;
      buyView.ylb = calcFactor.ylb;
      buyView.zlb = calcFactor.zlb;
      buyView.srlb = calcFactor.srlb;
      buyView.total = calcEachTypeCost(calcFactor);
      buyView.untradeableKeys = calcEachTypeKeys(calcFactor);
      buyView.rest = formData.rmbBudget - buyView.total;
      const keyArray = [
        tradeableKeys.t1298 > 0 ? `1298元${tradeableKeys.t1298}次` : undefined,
        tradeableKeys.t648 > 0 ? `648元${tradeableKeys.t648}次` : undefined,
        tradeableKeys.t328 > 0 ? `328元${tradeableKeys.t328}次` : undefined,
        tradeableKeys.t198 > 0 ? `198元${tradeableKeys.t198}次` : undefined,
        tradeableKeys.t98 > 0 ? `98元${tradeableKeys.t98}次` : undefined,
        tradeableKeys.t30 > 0 ? `30元${tradeableKeys.t30}次` : undefined,
        tradeableKeys.t6 > 0 ? `6元${tradeableKeys.t6}次` : undefined,
      ].filter(item => item !== undefined);
      if (tradeableKeys.totalKeys !== 0) {
        buyView.tradeableKeys = keyArray.join(',') + `，共计${tradeableKeys.totalKeys}个不朽闪光钥匙`;
      } else {
        buyView.tradeableKeys = undefined;
      }
    }

    // 默认计算一次
    lvUpCost.value = calcTotal();

    const onStoneDelete = () => {
      context.emit('stone-delete', props.name);
    }

    return {
      formData,
      buyView,
      lvUpCost,
      fromCurr2LvUpCost,
      calcProcess,
      stoneGm,
      onConditionChanged,
      onCalcBudgetUseType,
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
                <a-col :span="6">
                  <a-form-item name="lsCurrentLevel" label="当前等级">
                    <a-select v-model:value="formData.currentLevel" @change="onConditionChanged">
                      <a-select-option :value="-1">我还没有石头</a-select-option>
                      <a-select-option v-for="(level) in formData.updateToLevel" :value="level">lv{{
                        level
                      }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item name="lsCurrentLevel" label="已有能量">
                    <a-input-number v-model:value="formData.hasEnergy" :step="1" style="width: 100%;" :min="0"
                      @change="onConditionChanged">
                      <template #addonAfter>
                        <span>个</span>
                      </template>
                    </a-input-number>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item name="lslvUpCurrentStar" label="是否升级到当前星数">
                    <a-switch v-model:checked="formData.isLvUpCurrentStar" @change="onConditionChanged"></a-switch>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="6">
                  <a-form-item name="lsRmbBudget" label="预算总额">
                    <a-input-number v-model:value="formData.rmbBudget" :step="100" style="width: 100%;" :min="0"
                      @change="onCalcBudgetUseType"></a-input-number>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item name="lsRmbBudget" label="预算使用时间" suffix="月">
                    <a-input-number v-model:value="formData.budgetUseMonths" :step="1" style="width: 100%;" :min="1"
                      @change="onCalcBudgetUseType">
                      <template #addonAfter>
                        <span>月</span>
                      </template>
                    </a-input-number>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-descriptions title="预算最佳使用方式" layout="vertical">
                    <a-descriptions-item label="先祖之路">{{ buyView.xz }}<h5>&nbsp;次</h5></a-descriptions-item>
                    <a-descriptions-item label="月卡">{{ buyView.yk }}<h5>&nbsp;次</h5></a-descriptions-item>
                    <a-descriptions-item label="月礼包">{{ buyView.ylb }}<h5>&nbsp;次</h5></a-descriptions-item>
                    <a-descriptions-item label="周礼包">
                      {{ buyView.zlb }}<h5>&nbsp;次</h5>
                    </a-descriptions-item>
                    <a-descriptions-item label="三日礼包">
                      {{ buyView.srlb }}<h5>&nbsp;次</h5>
                    </a-descriptions-item>
                    <a-descriptions-item label="共计花费">
                      {{ buyView.total }}<h5>&nbsp;元</h5>
                    </a-descriptions-item>
                    <a-descriptions-item label="共计不朽钥匙">
                      {{ buyView.untradeableKeys }}<h5>&nbsp;个</h5>
                    </a-descriptions-item>
                    <a-descriptions-item label="剩余预算">
                      {{ buyView.rest }}<h5>&nbsp;元</h5>
                    </a-descriptions-item>
                    <a-descriptions-item v-if="buyView.tradeableKeys != null" label="不朽闪光钥匙">{{
                      buyView.tradeableKeys
                    }}</a-descriptions-item>
                  </a-descriptions>
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