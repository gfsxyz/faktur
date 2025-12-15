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

interface Step3Props {
  form: UseFormReturn<any>;
}

export function Step3Contact({ form }: Step3Props) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <Form {...form}>
        <form className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+1 (555) 123-4567"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Website</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://company.com"
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
