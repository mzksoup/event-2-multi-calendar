import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import { CalendarPlus, ArrowLeft, Download, Info } from "lucide-react";
import { FaGoogle, FaApple, FaMicrosoft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateGoogleCalendarUrl, generateOutlookUrl, createCalendarEvent } from "@/lib/calendar-utils";
import type { Event } from "@shared/schema";

export default function CalendarSelection() {
  const params = useParams();
  const shareId = params.shareId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${shareId}`],
    enabled: !!shareId,
  });

  const formatDateTime = (date: string, startTime: string, endTime: string) => {
    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);
    const dateStr = startDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = `${startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    return `${dateStr} ${timeStr}`;
  };

  const handleGoogleCalendar = () => {
    if (!event) return;
    
    const calendarEvent = createCalendarEvent(
      event.title,
      event.date,
      event.startTime,
      event.endTime,
      event.description || undefined,
      event.location || undefined
    );
    
    const url = generateGoogleCalendarUrl(calendarEvent);
    window.open(url, '_blank');
    
    toast({
      title: "Google カレンダーを開いています",
      description: "新しいタブでGoogle カレンダーが開きます",
    });
  };

  const handleiOSCalendar = () => {
    if (!event) return;
    
    const icsUrl = `/api/events/${event.shareId}/ics`;
    const link = document.createElement('a');
    link.href = icsUrl;
    link.download = `${event.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "カレンダーファイルをダウンロード中",
      description: "ダウンロードしたファイルをタップしてカレンダーに追加してください",
    });
  };

  const handleOutlookCalendar = () => {
    if (!event) return;
    
    const calendarEvent = createCalendarEvent(
      event.title,
      event.date,
      event.startTime,
      event.endTime,
      event.description || undefined,
      event.location || undefined
    );
    
    const url = generateOutlookUrl(calendarEvent);
    window.open(url, '_blank');
    
    toast({
      title: "Outlook カレンダーを開いています",
      description: "新しいタブでOutlook カレンダーが開きます",
    });
  };

  const handleDownloadICS = () => {
    if (!event) return;
    
    const icsUrl = `/api/events/${event.shareId}/ics`;
    const link = document.createElement('a');
    link.href = icsUrl;
    link.download = `${event.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "カレンダーファイルをダウンロード中",
      description: ".ics ファイルは様々なカレンダーアプリで利用できます",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">予定が見つかりません</h1>
              <p className="text-gray-600 mb-6">指定された予定は存在しないか、削除された可能性があります。</p>
              <Button onClick={() => setLocation("/")}>
                新しい予定を作成
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarPlus className="text-primary mr-3" size={28} />
            カレンダー予定共有
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">カレンダーを選択</h2>
                <p className="text-gray-600">予定を追加するカレンダーアプリを選択してください</p>
              </div>

              {/* Event Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <CalendarPlus className="mr-2" size={16} />
                  <span>{event.title}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDateTime(event.date, event.startTime, event.endTime)}</span>
                </div>
              </div>

              {/* Calendar Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Google Calendar */}
                <button
                  onClick={handleGoogleCalendar}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <FaGoogle className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Google カレンダー</h3>
                  <p className="text-sm text-gray-600">Gmail と連携したカレンダー</p>
                  <div className="mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    追加する →
                  </div>
                </button>

                {/* iOS Calendar */}
                <button
                  onClick={handleiOSCalendar}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-800 hover:shadow-md transition-all text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <FaApple className="text-gray-800 text-2xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">iOS カレンダー</h3>
                  <p className="text-sm text-gray-600">iPhone・iPad 標準カレンダー</p>
                  <div className="mt-4 text-gray-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    追加する →
                  </div>
                </button>

                {/* Outlook Calendar */}
                <button
                  onClick={handleOutlookCalendar}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-md transition-all text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <FaMicrosoft className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Outlook カレンダー</h3>
                  <p className="text-sm text-gray-600">Microsoft Office 365</p>
                  <div className="mt-4 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    追加する →
                  </div>
                </button>
              </div>

              {/* Alternative Options */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4 text-center">その他のオプション</h4>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleDownloadICS}
                    variant="outline"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    <Download className="mr-2" size={16} />
                    .ics ファイルをダウンロード
                  </Button>
                  <Button
                    onClick={() => setLocation(`/event/${event.shareId}`)}
                    variant="outline"
                    className="px-6 py-3 text-sm font-medium"
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    戻る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Info className="text-primary" size={14} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">使い方</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 使用しているカレンダーアプリを選択してください</li>
                    <li>• 選択後、自動的にカレンダーアプリが開きます</li>
                    <li>• .ics ファイルは様々なカレンダーアプリで利用できます</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
