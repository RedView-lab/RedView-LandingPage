export const SELECT_TRIGGER_CLASSNAME =
  "flex h-10 w-full items-center justify-between rounded-[8px] border border-[rgba(213,215,218,0.16)] bg-white/8 px-3 text-left text-[16px] leading-6 text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[background-color,border-color,box-shadow] duration-150 hover:bg-white/10 focus-visible:border-white/28 focus-visible:bg-white/10 focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]";

export const SELECT_LISTBOX_CLASSNAME =
  "absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[5px] border border-white/10 bg-[#262626] shadow-[2px_2px_4px_rgba(0,0,0,0.24)]";

export function getSelectOptionClassName({
  isActive,
  isSelected,
}: {
  isActive: boolean;
  isSelected: boolean;
}) {
  return `flex min-h-[30px] w-full items-center gap-[8px] px-[10px] pr-[6px] text-left text-white transition-colors focus-visible:outline-none ${isSelected ? "bg-white/16" : isActive ? "bg-white/12" : "bg-transparent hover:bg-white/12 focus-visible:bg-white/12"}`.trim();
}