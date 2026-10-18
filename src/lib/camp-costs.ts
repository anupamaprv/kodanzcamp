export type CostSelection = { kidId: string; week: string; campId: string };
export type CostCamp = { id: string; pricePerWeek: number };

export function summerCosts(kidIds: string[], weeks: string[], selections: CostSelection[], camps: CostCamp[], rates: Record<string, number> = {}) {
  const rows = weeks.map((week) => {
    const children = kidIds.map((kidId) => {
      const choices = selections.filter((s) => s.kidId === kidId && s.week === week);
      const total = choices.reduce((sum, s) => {
        const camp = camps.find((c) => c.id === s.campId);
        const price = rates[s.campId] ?? camp?.pricePerWeek;
        return sum + (price != null && Number.isFinite(price) && price >= 0 ? price : 0);
      }, 0);
      return { kidId, total, unknown: choices.some((s) => !camps.some((c) => c.id === s.campId)) };
    });
    return { week, children, total: children.reduce((sum, c) => sum + c.total, 0) };
  });
  return { rows, total: rows.reduce((sum, row) => sum + row.total, 0), children: kidIds.map((kidId) => ({ kidId, total: rows.reduce((sum, row) => sum + (row.children.find((c) => c.kidId === kidId)?.total ?? 0), 0) })) };
}