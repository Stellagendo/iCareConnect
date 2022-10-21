import { Component, Inject, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormValue } from "../../modules/form/models/form-value.model";
import { Textbox } from "../../modules/form/models/text-box.model";

import { omit } from "lodash";
import { LocationService } from "src/app/core/services";
import { Dropdown } from "../../modules/form/models/dropdown.model";

@Component({
  selector: "app-manage-location-modal",
  templateUrl: "./manage-location-modal.component.html",
  styleUrls: ["./manage-location-modal.component.scss"],
})
export class ManageLocationModalComponent implements OnInit {
  dialogData: any;

  locationFields: any[] = [];
  serviceConceptsField: any;
  formsField: any;
  formValues: any = {};
  isFormValid: boolean;

  selectedTags: any = {};
  errorMessage: string;

  saving: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<ManageLocationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private locationService: LocationService
  ) {
    this.dialogData = data;
  }

  ngOnInit(): void {
    this.selectedTags[this.dialogData?.locationTag?.uuid] =
      this.dialogData?.locationTag?.uuid;

    // if (this.dialogData?.location?.)
    this.locationFields = [
      new Textbox({
        id: "displayName",
        key: "displayName",
        label: "Name",
        value: this.dialogData?.edit
          ? this.dialogData?.location?.display
          : null,
        required: true,
      }),
      new Textbox({
        id: "description",
        key: "description",
        label: "Description",
        value: this.dialogData?.edit
          ? this.dialogData?.location?.description
          : null,
        required: true,
      }),
    ];

    const serviceAttribute = (this.dialogData?.location?.attributes?.filter(
      (attribute) =>
        attribute?.attributeType?.display?.toLowerCase() === "services"
    ) || [])[0];

    this.serviceConceptsField = new Dropdown({
      id: "service",
      key: "service",
      options: this.dialogData?.edit
        ? [
            {
              key: serviceAttribute?.value,
              value: serviceAttribute?.value,
              label: "Test",
              name: "Test",
            },
          ]
        : [],
      label: "Service",
      conceptClass: "Service",
      searchControlType: "concept",
      value: serviceAttribute ? serviceAttribute?.value : null,
      searchTerm: "ICARE_CONSULTATION_SERVICE",
      shouldHaveLiveSearchForDropDownFields: true,
    });

    this.formsField = new Dropdown({
      id: "form",
      key: "form",
      options: [],
      label: "Form",
      searchControlType: "form",
      shouldHaveLiveSearchForDropDownFields: true,
    });
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    this.dialogRef.close();
  }

  onSave(event: Event): void {
    event.stopPropagation();
    // TODO: Find a way to softcode attribute type uuid using system settings

    let attributes = [
      {
        attributeType: "d6794daf-f62f-454e-89eb-6ea98188352f",
        value: this.formValues["service"]?.value,
      },
      {
        attributeType: "iCARE101-UDSM-451f-8efe-a0db56f09676",
        value: this.formValues["module"]?.value,
      },
      {
        attributeType: "iCAR7002-UDSM-attr-8efe-a0db56f09676",
        value: this.formValues["service"]?.value,
      },
      {
        attributeType: "2c266002-2848-4d2b-bf1f-8b59d81e3f29",
        value: this.formValues["form"]?.value,
      },
    ];
    const data = {
      name: this.formValues["displayName"]?.value,
      description: this.formValues["description"]?.value,
      parentLocation: this.dialogData?.parentLocation,
      tags: Object.keys(this.selectedTags).map((key) => key) || [],
      attributes: attributes?.filter((attribute) => attribute?.value),
    };
    this.saving = true;
    this.locationService.createLocation(data).subscribe((response: any) => {
      if (response && !response?.error) {
        this.errorMessage = null;
        this.saving = false;
        setTimeout(() => {
          this.dialogRef.close();
        }, 2000);
      } else {
        this.saving = false;
        this.errorMessage = response?.error?.message;
      }
    });
  }

  getSelectedValue(event: MatCheckboxChange, tagUuid: string): void {
    if (event["checked"]) {
      this.selectedTags[tagUuid] = tagUuid;
    } else {
      this.selectedTags = omit(this.selectedTags);
    }
  }

  onFormUpdate(formValues: FormValue): void {
    this.isFormValid = formValues.isValid;
    this.formValues = { ...this.formValues, ...formValues.getValues() };
  }

  onFormUpdateForServices(formValues: FormValue): void {
    this.formValues = { ...this.formValues, ...formValues.getValues() };
    console.log(this.formValues);
  }

  onFormUpdateForForm(formValues: FormValue): void {
    this.formValues = { ...this.formValues, ...formValues.getValues() };
    console.log(this.formValues);
  }
}
