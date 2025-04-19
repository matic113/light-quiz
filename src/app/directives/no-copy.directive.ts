import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoCopy]',
})
export class NoCopyDirective {
  @HostListener('copy', ['$event']) onCopy(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('cut', ['$event']) onCut(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('contextmenu', ['$event']) onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('selectstart', ['$event']) onSelect(event: Event) {
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event']) onDrag(event: Event) {
    event.preventDefault();
  }

  // Prevent Ctrl+C, Ctrl+X, Ctrl+V (copy, cut, paste)
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Disable Ctrl + C (copy), Ctrl + X (cut), Ctrl + V (paste)
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 's' ||
        event.key === 'س' ||
        event.key === 'c' ||
        event.key === 'ؤ' ||
        event.key === 'x' ||
        event.key === 'ء' ||
        event.key === 'v' ||
        event.key === 'ر')
    ) {
      event.preventDefault();
    }

    // Disable Ctrl + A (select all)
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'a' || event.key === 'ش')
    ) {
      event.preventDefault();
    }

    // Disable F12 (Developer Tools)
    if (event.key === 'F12') {
      alert('Developer Tools Not Allowed.');
      event.preventDefault();
    }

    // Disable Print Screen (PrtScn)
    if (event.key === 'PrintScreen') {
      event.preventDefault();
    }
  }
}
