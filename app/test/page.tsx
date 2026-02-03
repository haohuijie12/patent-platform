export default function TestPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          欢迎来到测试实验室
        </h3>
        <p className="text-sm text-muted-foreground">
          请从左侧菜单选择一个测试功能开始。
        </p>
      </div>
    </div>
  );
}
