import { addDays, differenceInDays, parseISO, format, subDays } from 'date-fns';
import { PeriodEntry, CycleComputed, CycleStats } from '../types';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

export const calculateCycleStats = (history: PeriodEntry[]): CycleStats => {
  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  let avgCycleLength = DEFAULT_CYCLE_LENGTH;
  let avgPeriodLength = DEFAULT_PERIOD_LENGTH;

  if (sortedHistory.length >= 2) {
    let cycleSum = 0;
    let periodSum = 0;
    
    // Calculate cycles
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = parseISO(sortedHistory[i].startDate);
      const previous = parseISO(sortedHistory[i+1].startDate);
      cycleSum += differenceInDays(current, previous);
      periodSum += sortedHistory[i].lengthDays;
    }
    // Add last period length
    periodSum += sortedHistory[sortedHistory.length - 1].lengthDays;

    avgCycleLength = Math.round(cycleSum / (sortedHistory.length - 1));
    avgPeriodLength = Math.round(periodSum / sortedHistory.length);
  } else if (sortedHistory.length === 1) {
    avgPeriodLength = sortedHistory[0].lengthDays;
  }

  // Prediction Logic
  const lastPeriodStart = sortedHistory.length > 0 ? sortedHistory[0].startDate : format(new Date(), 'yyyy-MM-dd');
  const lastStartObj = parseISO(lastPeriodStart);
  
  const predictedNextStartObj = addDays(lastStartObj, avgCycleLength);
  const predictedOvulationObj = subDays(predictedNextStartObj, 14);
  const fertileWindowStartObj = subDays(predictedOvulationObj, 5);
  const fertileWindowEndObj = addDays(predictedOvulationObj, 1);

  const computed: CycleComputed = {
    lastPeriodStart,
    predictedNextStart: format(predictedNextStartObj, 'yyyy-MM-dd'),
    predictedOvulation: format(predictedOvulationObj, 'yyyy-MM-dd'),
    fertileWindowStart: format(fertileWindowStartObj, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileWindowEndObj, 'yyyy-MM-dd')
  };

  return {
    periodHistory: sortedHistory,
    avgCycleLength,
    avgPeriodLength,
    computed
  };
};

export const getDayStatus = (date: Date, stats: CycleStats): 'period' | 'predicted' | 'fertile' | 'none' => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Check history
  for (const p of stats.periodHistory) {
    const start = parseISO(p.startDate);
    const end = addDays(start, p.lengthDays - 1);
    const check = parseISO(dateStr);
    if (check >= start && check <= end) return 'period';
  }

  // Check predicted
  const predStart = parseISO(stats.computed.predictedNextStart);
  const predEnd = addDays(predStart, stats.avgPeriodLength - 1);
  const check = parseISO(dateStr);
  
  if (check >= predStart && check <= predEnd) return 'predicted';

  // Check fertile
  const fertileStart = parseISO(stats.computed.fertileWindowStart);
  const fertileEnd = parseISO(stats.computed.fertileWindowEnd);
  
  if (check >= fertileStart && check <= fertileEnd) return 'fertile';

  return 'none';
};
