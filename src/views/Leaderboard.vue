<template>
  <main class="stats">
    <h1>Posiciones</h1>
    <div class="stats-dashboard">
      <div class="stats-card">
        <h2>Elo Global</h2>
        <p class="bronze-100">.</p>
        <table v-if="globalLeaderboard.length" class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th v-if="SHOW_ELO">Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in globalLeaderboard" :key="entry.profile_id">
              <td
                  class="leaderboard-rank">
                {{ index + 1 }}
              </td>
              <td>
                <div class="cell-wrapper player-table__item">
                  <img
                      v-if="entry.player?.god"
                      class="leaderboard-avatar"
                      :src="`/img/gods/${entry.player.god}_icon.avif`"/>
                  {{ entry.name }}
                </div>
              </td>
              <td v-if="SHOW_ELO">{{ eloWhole(entry.elo) }}<span class="bronze-100">.{{ eloDecimal(entry.elo) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de elo global.</div>
      </div>

      <div class="stats-card">
        <h2>Elo por Dios Mayor</h2>
        <p class="bronze-100">Sólo se muestran resultados en los últimos 2 meses.</p>
        <table v-if="godLeaderboard.length" class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Dios</th>
              <th v-if="SHOW_ELO">Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in godLeaderboard" :key="`${entry.profile_id}-${entry.god}`">
              <td
                  class="leaderboard-rank"
                  :style="{ borderLeft: `4px solid ${entry.player?.color ?? 'transparent'}` }">
                {{ index + 1 }}
              </td>
              <td>
                {{ entry.name }}
              </td>
              <td>
                <div class="cell-wrapper player-table__item">
                  <img
                      class="leaderboard-avatar"
                      :src="`/img/gods/${entry.god}_icon.avif`"/>
                  {{ entry.god }}
                </div>
              </td>

              <td v-if="SHOW_ELO">{{ eloWhole(entry.elo) }}<span class="bronze-100">.{{ eloDecimal(entry.elo) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de elo por dios mayor.</div>
      </div>
    </div>
    <div class="stats-card elo-history">
      <div class="elo-history__header">
        <h2>Historial de Elo</h2>
        <div>
          <label>Filtrar desde: </label>
          <select v-model="timestampFilter">
            <option value="1-week">1 semana</option>
            <option value="2-week">2 semanas</option>
            <option value="1-month">1 mes</option>
            <option value="2-month">2 meses</option>
            <option value="6-month">6 meses</option>
            <option value="all">Todo</option>
          </select>
        </div>
      </div>
      <div v-if="eloChartData.datasets.length" class="chart">
        <Line
            :data="eloChartData"
            :options="eloChartOptions"/>
      </div>
      <div v-else class="empty-state">No hay historial de elo en ese intervalo de tiempo.</div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { PLAYERS_ARRAY } from '../data/players';
import { SHOW_ELO } from '@/config/featureFlags.js';
import { getEloChartOptions } from '@/data/chartOptions.js';
import { getFilterTimestamp, toMs } from '@/helpers/time.js';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

const PLAYERS_BY_ID = Object.fromEntries(PLAYERS_ARRAY.map(p => [p.profile_id, p]));

const globalLeaderboard = ref([]);
const godLeaderboard = ref([]);

const timestampFilter = ref('6-month');
const timestampValue = computed(() => getFilterTimestamp(timestampFilter.value));

const eloChartData = computed(() => ({
  datasets: globalLeaderboard.value
    .filter(entry => entry.history?.length)
    .map(entry => {
      const color = entry.player?.color;
      return {
        label: entry.name,
        data: entry.history.map(point => ({ ...point, startgametime: toMs(point.startgametime) })),
        stepped: true,
        pointRadius: 2,
        borderColor: color,
        backgroundColor: color,
        pointBorderColor: color,
        pointBackgroundColor: color,
      };
    }),
}));

const eloChartOptions = getEloChartOptions(SHOW_ELO);

function eloWhole(elo) {
  return elo.toFixed(1).split('.')[0];
}

function eloDecimal(elo) {
  return elo.toFixed(1).split('.')[1];
}

async function fetchLeaderboard(scope, after = 0) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leaderboard?scope=${scope}&after=${after}`);
    const data = await res.json();
    return (data.leaderboard ?? []).map(entry => ({
      ...entry,
      player: PLAYERS_BY_ID[entry.profile_id],
    }));
  } catch {
    return [];
  }
}

onMounted(async () => {
  globalLeaderboard.value = await fetchLeaderboard('global', timestampValue.value);
  godLeaderboard.value = await fetchLeaderboard('god');
});

watch(timestampFilter, async () => {
  globalLeaderboard.value = await fetchLeaderboard('global', timestampValue.value);
});
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.stats
  max-width: 1180px
  padding: 0 16px
  margin: auto

.stats-dashboard
  margin-top: 16px
  display: grid
  gap: 36px
  grid-template-columns: 1fr 1fr
  padding-bottom: 48px
  @media (max-width: 768px)
    gap: 24px
    grid-template-columns: 1fr

.stats-card
  h2
    margin-bottom: 8px

.elo-history
  margin-top: 16px

.elo-history__header
  display: flex
  flex-wrap: wrap
  gap: 8px
  align-items: baseline
  justify-content: space-between

.chart
  height: 450px

.empty-state
  margin-top: 10px
  padding: 20px
  color: $bronze-50
  text-align: center
  border: 1px solid $bronze-200

.leaderboard-avatar
  width: 28px
  height: 28px

.leaderboard-rank
  color: $bronze-100
  padding-left: 14px

.bronze-100
  color: $bronze-100
</style>
