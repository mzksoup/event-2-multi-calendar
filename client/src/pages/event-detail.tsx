import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import { Check, Copy, CalendarPlus, Plus, Calendar, Clock, MapPin, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";

export default function EventDetail() {
  const params = useParams();
  const shareId = params.shareId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${shareId}`],
    enabled: !!shareId,
  });

  const copyToClipboard = async () => {
    if (!event) return;
    
    const shareUrl = `${window.location.origin}/calendar/${event.shareId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "URLがコピーされました",
        description: "共有用URLがクリップボードにコピーされました",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "コピーに失敗しました",
        description: "URLのコピーに失敗しました",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: string, startTime: string, endTime: string) => {
    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);
    
    const dateStr = startDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    const timeStr = `${startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    
    return `${dateStr} ${timeStr}`;
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
              <Skeleton className="h-32 w-full mb-8" />
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
                <Plus className="mr-2" size={16} />
                新しい予定を作成
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/calendar/${event.shareId}`;

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
          <Card className="overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-500 text-white p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Check size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">予定が作成されました！</h2>
                  <p className="text-green-100">共有用URLが生成されました</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <CardContent className="p-6 md:p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">予定詳細</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start">
                    <Calendar className="text-gray-400 mt-1 mr-3" size={20} />
                    <div>
                      <span className="font-medium text-gray-900">{event.title}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="text-gray-400 mt-1 mr-3" size={20} />
                    <div>
                      <span className="text-gray-700">{formatDateTime(event.date, event.startTime, event.endTime)}</span>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-start">
                      <MapPin className="text-gray-400 mt-1 mr-3" size={20} />
                      <div>
                        <span className="text-gray-700">{event.location}</span>
                      </div>
                    </div>
                  )}
                  
                  {event.description && (
                    <div className="flex items-start">
                      <AlignLeft className="text-gray-400 mt-1 mr-3" size={20} />
                      <div>
                        <span className="text-gray-700">{event.description}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share URL Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">共有用URL</h3>
                <div className="flex items-center bg-gray-50 rounded-lg p-4">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-gray-700 font-mono text-sm border-none focus:ring-0"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className={`ml-3 px-4 py-2 text-sm font-medium transition-colors ${
                      copied 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-primary hover:bg-blue-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1" size={16} />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1" size={16} />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">このURLを共有することで、相手がカレンダーに予定を追加できます</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setLocation(`/calendar/${event.shareId}`)}
                  className="flex-1 bg-primary text-white py-3 px-6 font-medium hover:bg-blue-700"
                >
                  <CalendarPlus className="mr-2" size={16} />
                  カレンダーに追加
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="flex-1 py-3 px-6 font-medium"
                >
                  <Plus className="mr-2" size={16} />
                  新しい予定を作成
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
