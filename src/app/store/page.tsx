
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, where, doc, updateDoc, increment, getDoc, runTransaction } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, ShoppingCart, History, ArrowLeft, Loader2, CheckCircle, ScrollText, Ankh, Gem } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// --- Type Definitions ---
type PaymentMessage = {
  type: 'success' | 'error' | 'info' | null;
  title: string;
  body: string;
};

interface Purchase {
    id: string;
    productId: string;
    productName?: string;
    price: number;
    purchaseDate: string;
    status: 'Awaiting Payment' | 'Completed' | 'Refunded';
    isGift?: boolean;
    recipientEmail?: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price?: number;
    nilePointsPrice?: number;
    icon: 'ScrollText' | 'Ankh';
}

const ICONS: Record<string, React.ElementType> = {
    ScrollText,
    Ankh,
};

export default function StorePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [paymentMessage, setPaymentMessage] = useState<PaymentMessage | null>(null);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftProduct, setGiftProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('treasures');

  const appId = 'yalla-masry-academy';
  const purchasesCollectionPath = `/artifacts/${appId}/public/data/digital_purchases`;

  // --- Firestore Queries ---
  const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const userPurchasesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, purchasesCollectionPath), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);
  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<Purchase>(userPurchasesQuery);

  useEffect(() => {
    if (products && products.length > 0 && !giftProduct) {
        setGiftProduct(products[0].id);
    }
  }, [products, giftProduct]);


  const buyProduct = async (product: Product, isGift: boolean = false, recipientEmail: string | null = null) => {
    setIsSubmitting(true);
    setPaymentMessage(null);

    if (!user || !firestore) {
      toast({ 
        variant: 'destructive',
        title: 'محتوى محمي للملوك فقط', 
        description: 'لا يمكن إتمام عملية الشراء. يرجى تسجيل الدخول أولاً للمتابعة.' 
      });
      setIsSubmitting(false);
      return;
    }

    if (isGift && (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail))) {
        toast({ variant: 'destructive', title: 'خطأ في بيانات الهدية', description: 'الرجاء إدخال بريد إلكتروني صحيح للشخص الذي ستهديه المنتج.' });
        setIsSubmitting(false);
        return;
    }
    
    setPaymentMessage(null); // Clear previous messages

    const purchaseData: any = {
      userId: user.uid,
      productId: product.id,
      productName: product.name,
      price: product.price,
      status: 'Awaiting Payment',
      purchaseDate: new Date().toISOString(),
      isGift: isGift,
    };
    if (isGift) {
        purchaseData.recipientEmail = recipientEmail;
    }
    
    addDocumentNonBlocking(collection(firestore, purchasesCollectionPath), purchaseData);

    const successMessageBody = isGift 
      ? `<strong>تم تسجيل طلبك بنجاح!</strong><br/><br/>
         شكراً لك على كرمك! طلبك لإهداء <strong>"${product.name}"</strong> إلى ${recipientEmail} قيد المراجعة.<br/><br/>
         سيتم التواصل معك عبر بريدك لإتمام الدفع، وبعدها سنقوم بإرسال الهدية بالنيابة عنك.`
      : `<strong>تم تسجيل طلبك بنجاح!</strong><br/><br/>
         مرحباً بك في خطوتك الأولى نحو الإتقان! طلبك لشراء <strong>"${product.name}"</strong> هو الآن قيد المراجعة.<br/><br/>
         <strong>الخطوة التالية:</strong> لإتمام عملية الشراء، سيقوم فريق الإدارة لدينا بالتواصل معك عبر البريد الإلكتروني المسجل لدينا خلال الساعات القادمة لتزويدك برابط دفع آمن ومباشر.`;
    
    if (user) {
        setPaymentMessage({
            type: 'success',
            title: '✅ تم استلام طلبك بنجاح!',
            body: successMessageBody,
        });
    }
    
    if (isGift) setGiftEmail('');
    setIsSubmitting(false);
  };
  
  const buyWithNilePoints = async (product: Product) => {
    if (!firestore || !user || !product.nilePointsPrice) return;

    setIsSubmitting(true);
    const userRef = doc(firestore, 'users', user.uid);
    const pointsCost = product.nilePointsPrice;

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }

            const currentPoints = userDoc.data().nilePoints || 0;
            if (currentPoints < pointsCost) {
                throw `ليس لديك نقاط نيل كافية! تحتاج إلى ${pointsCost} نقطة.`;
            }

            const newPoints = currentPoints - pointsCost;
            transaction.update(userRef, { nilePoints: newPoints });

            const purchaseData = {
                userId: user.uid,
                productId: product.id,
                productName: product.name,
                price: 0, // No real money involved
                nilePointsPrice: pointsCost,
                purchaseDate: new Date().toISOString(),
                status: 'Completed' as const,
                isGift: false,
            };
            const newPurchaseRef = doc(collection(firestore, purchasesCollectionPath));
            transaction.set(newPurchaseRef, purchaseData);
        });
        
        toast({
            title: '🎉 تهانينا!',
            description: `لقد اشتريت "${product.name}" بنجاح باستخدام نقاط النيل.`,
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'فشل الشراء',
            description: typeof error === 'string' ? error : error.message || "حدث خطأ أثناء محاولة الشراء بنقاط النيل.",
        });
    } finally {
        setIsSubmitting(false);
    }
};


  const getStatusChip = (status: Purchase['status']) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Awaiting Payment': return 'bg-yellow-100 text-yellow-800';
        case 'Refunded': return 'bg-gray-100 text-gray-800';
        default: return 'bg-blue-100 text-blue-800';
    }
  }

  const handleSendGift = () => {
    const productToSend = products?.find(p => p.id === giftProduct);
    if (productToSend) {
        buyProduct(productToSend, true, giftEmail);
    } else {
        toast({ variant: 'destructive', title: 'خطأ', description: 'المنتج المحدد غير موجود.' });
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPaymentMessage(null);
  }
  
  if (isUserLoading || isLoadingProducts) {
      return (
        <div className="flex justify-center items-center h-screen bg-nile-dark">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل خزانة الكنوز...</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-nile-dark text-white p-4 md:p-8" style={{ direction: 'rtl' }}>
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black royal-title mb-2">
          متجر كنوز المملكة
        </h1>
        <p className="text-xl text-sand-ochre">
          برديات حصرية وكنوز فرعونية لتعزيز رحلتك التعليمية.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
         {paymentMessage && user && (
            <div className={`p-6 rounded-xl mb-8 shadow-lg transition-all duration-300 ${paymentMessage.type === 'success' ? 'bg-green-800/20 border-green-500' : 'bg-red-800/20 border-red-500'} border`}>
                <div className="flex items-center gap-4">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                    <div>
                        <p className={`font-extrabold text-2xl mb-1 ${paymentMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>{paymentMessage.title}</p>
                        <div className={`text-md ${paymentMessage.type === 'success' ? 'text-green-200' : 'text-red-200'} space-y-2`} dangerouslySetInnerHTML={{ __html: paymentMessage.body }}></div>
                    </div>
                </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-nile/50 p-2 rounded-xl border border-sand-ochre/30">
              <TabsTrigger value="treasures" className="tab-trigger"><ShoppingCart className="w-5 h-5 ml-2"/> كنوز المملكة</TabsTrigger>
              <TabsTrigger value="gifts" className="tab-trigger"><Gift className="w-5 h-5 ml-2"/> إرسال هدية</TabsTrigger>
              <TabsTrigger value="history" className="tab-trigger" disabled={!user}><History className="w-5 h-5 ml-2"/> {user ? 'سجل طلباتك' : 'سجل الطلبات (للمسجلين)'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treasures" className="mt-8">
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {products.map(product => {
                            const Icon = ICONS[product.icon] || ScrollText;
                            return (
                                <div key={product.id} className="dashboard-card p-6 rounded-xl flex flex-col text-center items-center">
                                    <Icon className="w-20 h-20 text-gold-accent mb-4"/>
                                    <h3 className="text-2xl font-bold royal-title mb-3">{product.name}</h3>
                                    <p className="text-sand-ochre mb-4 flex-grow">{product.description}</p>
                                    
                                    <div className="w-full mt-6 space-y-4">
                                        {product.price && (
                                            <div className="flex justify-between items-center bg-nile-dark/30 p-3 rounded-lg">
                                                <span className="text-3xl font-extrabold text-white">${product.price}</span>
                                                <Button onClick={() => buyProduct(product)} disabled={isSubmitting || !user} className="cta-button">
                                                    {isSubmitting ? <Loader2 className="animate-spin"/> : 'اطلب الآن'}
                                                </Button>
                                            </div>
                                        )}
                                        {product.nilePointsPrice && (
                                            <div className="flex justify-between items-center bg-nile-dark/30 p-3 rounded-lg">
                                                 <span className="text-2xl font-extrabold text-white flex items-center gap-2">{product.nilePointsPrice} <Gem className="w-6 h-6 text-gold-accent"/></span>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button disabled={isSubmitting || !user || (user.nilePoints || 0) < product.nilePointsPrice} className="utility-button">
                                                            {isSubmitting ? <Loader2 className="animate-spin"/> : 'شراء بالنقاط'}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="dashboard-card text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>تأكيد الشراء بنقاط النيل</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-sand-ochre">
                                                                هل أنت متأكد من رغبتك في شراء "{product.name}" مقابل {product.nilePointsPrice} نقطة نيل؟ سيتم خصم النقاط من رصيدك فوراً.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => buyWithNilePoints(product)} className="cta-button">تأكيد الشراء</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-sand-ochre py-10">لا توجد منتجات في المتجر حالياً.</p>
                )}
                 {!user && (
                    <div className="mt-8 p-4 bg-yellow-900/50 text-yellow-300 border border-yellow-500 rounded-lg text-center">
                        يجب <Link href="/login" className="font-bold underline">تسجيل الدخول</Link> لتتمكن من شراء الكنوز.
                    </div>
                )}
            </TabsContent>
            
            <TabsContent value="gifts" className="mt-8">
                <div className="dashboard-card p-8 rounded-xl max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-center royal-title mb-3">أهدِ العلم لصديق</h3>
                    <p className="text-sand-ochre mb-6 text-center">شارك متعة تعلم العامية المصرية مع أصدقائك. اختر هدية وأرسلها لهم مع رسالة خاصة.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="friend_email" className="font-bold text-sand-ochre">بريد الصديق الإلكتروني:</label>
                            <input type="email" id="friend_email" placeholder="friend@example.com" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} className="w-full p-2 mt-1 border-2 bg-nile-dark border-sand-ochre/50 rounded-lg focus:ring-gold-accent focus:border-gold-accent text-white" />
                        </div>
                        <div>
                            <label htmlFor="gift_product" className="font-bold text-sand-ochre">اختر الهدية:</label>
                             <select id="gift_product" value={giftProduct} onChange={(e) => setGiftProduct(e.target.value)} className="w-full p-2 mt-1 border-2 bg-nile-dark border-sand-ochre/50 rounded-lg focus:ring-gold-accent focus:border-gold-accent text-white">
                                {products?.filter(p => p.price).map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                             </select>
                        </div>
                        <Button onClick={handleSendGift} disabled={isSubmitting || !user} className="w-full cta-button text-lg">
                           {isSubmitting ? <Loader2 className="animate-spin"/> : <><Gift className="inline-block ml-2"/> إرسال الهدية</>}
                        </Button>
                         {!user && <p className="text-red-400 text-center text-sm">يجب تسجيل الدخول لإرسال هدية.</p>}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-8">
                <div className="dashboard-card p-8 rounded-xl">
                    <h3 className="text-2xl font-bold royal-title mb-6 text-center">سجل الطلبات الملكية</h3>
                    {isLoadingPurchases ? (
                        <p className="text-center text-sand-ochre">جاري تحميل سجل طلباتك...</p>
                    ) : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map(p => (
                                <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border border-sand-ochre/20 rounded-lg bg-nile/50">
                                    <div className="md:col-span-2">
                                        <p className="font-bold text-white">{p.productName || p.productId}</p>
                                        <p className="text-sm text-gray-400">{new Date(p.purchaseDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                         {p.isGift && <p className="text-xs text-pink-400 font-semibold"> (هدية إلى: {p.recipientEmail})</p>}
                                    </div>
                                    <p className="text-lg font-bold text-white text-center">{p.price ? `$${p.price}`: <span className="flex items-center justify-center gap-2">{(p as any).nilePointsPrice} <Gem className="w-5 h-5 text-gold-accent"/></span>}</p>
                                    <div className="text-center">
                                       <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(p.status)}`}>{p.status === 'Awaiting Payment' ? 'بانتظار الدفع' : p.status === 'Completed' ? 'مكتمل' : p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sand-ochre py-8">لا يوجد لديك أي طلبات شراء مسجلة حتى الآن.</p>
                    )}
                </div>
            </TabsContent>
          </Tabs>
      </main>

      <footer className="mt-12 text-center">
        <Link href="/" className="utility-button px-6 py-2">
          <ArrowLeft className="inline-block ml-2"/> العودة للوحة التحكم
        </Link>
      </footer>
    </div>
  );
}

// Add custom styles for better theming
const style = document.createElement('style');
style.innerHTML = `
.tab-trigger {
  color: var(--sand-ochre);
  font-weight: bold;
  border-radius: 0.5rem;
  transition: all 0.3s;
}
.tab-trigger[data-state=active] {
  background-color: var(--gold-accent);
  color: var(--nile-dark);
  box-shadow: 0 4px 14px 0 rgba(255, 215, 0, 0.4);
}
.tab-trigger:hover:not([data-state=active]) {
  background-color: rgba(214, 184, 118, 0.1);
}
.tab-trigger[disabled] {
    color: #6b7280;
    cursor: not-allowed;
}
`;
document.head.appendChild(style);

    