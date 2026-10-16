import {test as base,expect} from '@playwright/test';
// Existing feature tests skip the optional photo step; photo.spec.js tests it explicitly.
export const test=base.extend({dismissOptionalPhoto:[async({page},use)=>{await page.addLocatorHandler(page.locator('#moment-dialog'),async()=>{await page.locator('#moment-skip').click();});await use();},{auto:true}]});
export {expect};
