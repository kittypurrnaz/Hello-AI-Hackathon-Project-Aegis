import { ChromeExtensionToggle } from './ChromeExtensionToggle';

export function ExtensionPopup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ChromeExtensionToggle />
    </div>
  );
}