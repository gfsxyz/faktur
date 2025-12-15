import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Step1Props {
  form: UseFormReturn<any>;
}

export function Step1CompanyInfo({ form }: Step1Props) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <Form {...form}>
        <form className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Company Name
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Acme Inc." className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Business Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="info@company.com"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
