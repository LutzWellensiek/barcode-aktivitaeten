import {BrowserMultiFormatReader} from '@zxing/browser';
import {BarcodeFormat,DecodeHintType} from '@zxing/library';
const hints=new Map([[DecodeHintType.POSSIBLE_FORMATS,[BarcodeFormat.ITF]],[DecodeHintType.ALLOWED_LENGTHS,[22,24]],[DecodeHintType.TRY_HARDER,true]]);
export function createReader() {return new BrowserMultiFormatReader(hints,{delayBetweenScanAttempts:180,delayBetweenScanSuccess:250});}
export function cameraMessage(error) {
  switch(error?.name) {
    case 'NotAllowedError': case 'PermissionDeniedError': return 'Kamerazugriff nicht erlaubt. In Safari im Seitenmenü die Kamera für diese Website erlauben und erneut starten. Alternativ Barcode eintippen.';
    case 'NotFoundError': case 'DevicesNotFoundError': return 'Keine Kamera gefunden. Bitte Barcode manuell eingeben oder ein Foto auswählen.';
    case 'NotReadableError': return 'Die Kamera ist gerade belegt. Andere Kamera-Apps schließen und erneut versuchen.';
    case 'OverconstrainedError': return 'Diese Kamera unterstützt die angefragte Einstellung nicht. Bitte erneut versuchen oder die manuelle Eingabe nutzen.';
    default:return 'Kamera konnte nicht gestartet werden. Bitte erneut versuchen oder Barcode manuell eingeben.';
  }
}
