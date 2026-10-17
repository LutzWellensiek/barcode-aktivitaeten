import {BrowserMultiFormatReader} from '@zxing/browser';
import {BarcodeFormat,DecodeHintType} from '@zxing/library';
const hints=new Map([[DecodeHintType.POSSIBLE_FORMATS,[BarcodeFormat.ITF]],[DecodeHintType.ALLOWED_LENGTHS,[22,24]],[DecodeHintType.TRY_HARDER,true]]);
export function createReader() {return new BrowserMultiFormatReader(hints,{delayBetweenScanAttempts:180,delayBetweenScanSuccess:250});}
export {cameraMessage} from './camera-errors.js';
