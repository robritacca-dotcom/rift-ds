/* The welcome greeting, by the visitor's own clock. Evening runs through
   the small hours: at 2am "good evening" is closer to true than "good
   morning", which belongs to a day that has not started yet.

   Read as a store rather than during render: pages are prerendered, so
   computing the hour on the server would bake the build machine's clock into
   the HTML. The server snapshot is empty and the real greeting lands on
   hydration; the widget reserves the line's height in CSS so nothing moves
   when the words arrive. The clock needs no subscription — nobody is
   watching a widget at the moment noon turns. */
export const greetingFor = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

export const subscribeClock = () => () => {};
export const readGreeting = () => greetingFor(new Date().getHours());
export const serverGreeting = () => "";
