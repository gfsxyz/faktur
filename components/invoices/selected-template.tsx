import { ClassicTemplate } from "./templates/classic-template";
import { NewYorkTemplate } from "./templates/newyork-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { ElegantTemplate } from "./templates/elegant-template";
import { SakuraTemplate } from "./templates/sakura-template";
import { CorporateTemplate } from "./templates/corporate-template";
import { TemplateType } from "./types";

interface SelectedTemplateComponentProps {
  template: TemplateType;
  invoiceData: any;
}

export function SelectedTemplateComponent({
  template,
  invoiceData,
}: SelectedTemplateComponentProps) {
  switch (template) {
    case "classic":
      return <ClassicTemplate invoice={invoiceData} />;
    case "newyork":
      return <NewYorkTemplate invoice={invoiceData} />;
    case "minimalist":
      return <MinimalistTemplate invoice={invoiceData} />;
    case "elegant":
      return <ElegantTemplate invoice={invoiceData} />;
    case "sakura":
      return <SakuraTemplate invoice={invoiceData} />;
    case "corporate":
      return <CorporateTemplate invoice={invoiceData} />;
    default:
      return <ClassicTemplate invoice={invoiceData} />;
  }
}
