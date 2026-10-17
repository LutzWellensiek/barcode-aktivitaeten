export function cameraMessage(error) {
  switch(error?.name) {
    case 'NotAllowedError': case 'PermissionDeniedError': case 'SecurityError': return 'Kamerazugriff nicht erlaubt. Bitte die Kamera in den Website-Einstellungen des Browsers zulassen und dann erneut anfragen. Eine gespeicherte Sperre kann diese App nicht selbst aufheben.';
    case 'NotFoundError': case 'DevicesNotFoundError': return 'Keine Kamera gefunden. Bitte Barcode manuell eingeben oder ein Foto auswählen.';
    case 'NotReadableError': return 'Die Kamera ist gerade belegt. Andere Kamera-Apps schließen und erneut versuchen.';
    case 'OverconstrainedError': return 'Diese Kamera unterstützt die angefragte Einstellung nicht. Bitte erneut versuchen oder die manuelle Eingabe nutzen.';
    default:return 'Kamera konnte nicht gestartet werden. Bitte erneut versuchen oder Barcode manuell eingeben.';
  }
}
