import { ConsoleLogs as ConsoleLogsComponent } from '@/components/logs/ConsoleLogs'

export const ConsoleLogs = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 h-full">
        <div className="h-full">
          <ConsoleLogsComponent />
        </div>
      </div>
    </div>
  )
}
