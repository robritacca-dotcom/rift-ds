"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LocaleProvider } from "rift-ds/behaviors/LocaleProvider";
import { Alert } from "rift-ds/components/Alert/Alert";
import { AnimatedNumber } from "rift-ds/components/AnimatedNumber/AnimatedNumber";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { Carousel } from "rift-ds/components/Carousel/Carousel";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { DatePicker } from "rift-ds/components/DatePicker/DatePicker";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import { DropdownMenu } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { SplitPane } from "rift-ds/components/SplitPane/SplitPane";
import { Stepper } from "rift-ds/components/Stepper/Stepper";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { TimePicker } from "rift-ds/components/TimePicker/TimePicker";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import styles from "./RtlBench.module.css";

type Direction = "rtl" | "ltr";

function Station({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`${styles.station} ${wide ? styles.wide : ""}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const rows = [
  { id: "1", values: { name: "مشروع الشمال", owner: "سارة", budget: 125000, due: "2026-11-04", progress: 64 } },
  { id: "2", values: { name: "تطبيق الهاتف", owner: "عمر", budget: 48250.5, due: "2026-12-18", progress: 22 } },
  { id: "3", values: { name: "إعادة التصميم", owner: "ليلى", budget: 9300, due: "2027-01-09", progress: 91 } },
];

const columns = [
  { key: "name", header: "المشروع", type: "text" as const, sortable: true },
  { key: "owner", header: "المالك", type: "text" as const },
  { key: "budget", header: "الميزانية", type: "currency" as const, format: { currency: "EGP" }, sortable: true },
  { key: "due", header: "الموعد", type: "date" as const, sortable: true },
  { key: "progress", header: "التقدم", type: "progress" as const },
];

/**
 * The right-to-left bench. The direction is set on <html> as well as the
 * bench, because a portaled overlay (a drawer, a menu, a tooltip) reads it
 * from the document, as it would in a real Arabic app.
 */
export function RtlBench() {
  const [direction, setDirection] = useState<Direction>("rtl");
  const [tab, setTab] = useState("overview");
  const [view, setView] = useState("week");
  const [date, setDate] = useState("2026-11-04");
  const [drawer, setDrawer] = useState(false);
  const [notify, setNotify] = useState(true);
  const [page, setPage] = useState(2);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("dir");
    root.setAttribute("dir", direction);
    return () => {
      if (previous === null) root.removeAttribute("dir");
      else root.setAttribute("dir", previous);
    };
  }, [direction]);

  return (
    <LocaleProvider locale={direction === "rtl" ? "ar-EG" : "en-US"}>
      <HiddenBackground />
      <DotBackground />
      <main className={styles.bench} dir={direction} lang={direction === "rtl" ? "ar" : "en"} id="main-content">
        <header className={styles.top}>
          <h1 className={styles.title}>{direction === "rtl" ? "اختبار الاتجاه" : "Direction bench"}</h1>
          <div className={styles.row}>
            <SegmentedControl
              aria-label="Direction"
              segments={[
                { value: "rtl", label: "RTL" },
                { value: "ltr", label: "LTR" },
              ]}
              value={direction}
              onValueChange={(next) => setDirection(next as Direction)}
            />
            <ThemeToggle size="compact" />
          </div>
        </header>

        <div className={styles.grid}>
          <Station title="التنقل">
            <Breadcrumb
              items={[{ label: "الرئيسية", href: "#" }, { label: "المشاريع", href: "#" }, { label: "مشروع الشمال" }]}
            />
            <Tabs
              tabs={[
                { value: "overview", label: "نظرة عامة" },
                { value: "tasks", label: "المهام" },
                { value: "files", label: "الملفات" },
              ]}
              value={tab}
              onValueChange={setTab}
            />
            <Pagination page={page} onPageChange={setPage} pageCount={8} />
          </Station>

          <Station title="النماذج">
            <Input label="بحث" iconLeft="search" placeholder="ابحث عن مشروع" />
            <Input label="البريد" iconRight="mail" placeholder="name@example.com" />
            <Checkbox label="تذكرني" defaultChecked />
            <ToggleSwitch label="الإشعارات" checked={notify} onCheckedChange={setNotify} />
            <SegmentedControl
              aria-label="العرض"
              segments={[
                { value: "day", label: "يوم" },
                { value: "week", label: "أسبوع" },
                { value: "month", label: "شهر" },
              ]}
              value={view}
              onValueChange={setView}
            />
          </Station>

          <Station title="الإجراءات">
            <div className={styles.row}>
              <Button label="التالي" iconRight="arrow_forward" />
              <Button label="رجوع" iconLeft="arrow_back" variant="secondary" />
              <CircularButton icon="send" ariaLabel="إرسال" tooltip="إرسال" tooltipPosition="end" />
              <DropdownMenu
                trigger="المزيد"
                items={[
                  { label: "نسخ", icon: "content_copy", keys: "mod+c" },
                  { label: "نقل", icon: "arrow_forward" },
                  { label: "حذف", icon: "delete", destructive: true },
                ]}
              />
            </div>
            <div className={styles.row}>
              <Button label="فتح الدرج" variant="secondary" onClick={() => setDrawer(true)} />
              <Kbd keys="mod+shift+p" />
            </div>
            <Drawer open={drawer} onOpenChange={setDrawer} side="start" size="sm" title="الإعدادات">
              <p>يفتح الدرج من بداية الصفحة.</p>
            </Drawer>
          </Station>

          <Station title="الحالة">
            <Alert variant="info" title="تحديث" description="تم حفظ التغييرات قبل دقيقة." dismissible />
            <ProgressBar value={64} showLabel ariaLabel="التقدم" />
            <div className={styles.row}>
              <Avatar name="سارة أحمد" status="online" statusLabel="متصلة" />
              <AnimatedNumber value={1234567.5} decimals={1} animateOnMount={false} />
            </div>
            <Stepper
              steps={[{ label: "الحساب" }, { label: "الفريق" }, { label: "الدفع" }]}
              activeStep={1}
            />
          </Station>

          <Station title="التاريخ والوقت">
            <DatePicker value={date} onDateSelect={setDate} />
            <TimePicker label="الوقت" defaultValue="14:30" />
          </Station>

          <Station title="العرض">
            <Carousel aria-label="شرائح" showArrows showDots>
              <div className={styles.slide}>١</div>
              <div className={styles.slide}>٢</div>
              <div className={styles.slide}>٣</div>
            </Carousel>
          </Station>

          <Station title="الألواح" wide>
            <div className={styles.split} id="rtl-split">
              <SplitPane defaultSplit={40} separatorLabel="تغيير الحجم">
                <div className={styles.pane}>الأول</div>
                <div className={styles.pane}>الثاني</div>
              </SplitPane>
            </div>
          </Station>

          <Station title="الجدول" wide>
            <DataTable columns={columns} rows={rows} selectable aria-label="المشاريع" />
          </Station>
        </div>
      </main>
    </LocaleProvider>
  );
}
