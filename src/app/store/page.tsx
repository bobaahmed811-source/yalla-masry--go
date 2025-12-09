'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

// Define the structure for a payment message
type PaymentMessage = {
  type: 'success' | 'error' | null;
  title: string;
  body: string;
};

export default function StorePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [showProducts, setShowProducts] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<PaymentMessage | null>(null);

  // This ID would typically come from your environment configuration
  const appId = 'yalla-masry-academy';

  useEffect(() => {
    if (!isUserLoading) {
      setShowProducts(true);
    }
  }, [isUserLoading, user]);

  const buyProduct = async (productName: string, price: number) => {
    setPaymentMessage(null); // Clear previous messages

    if (!firestore) {
      setPaymentMessage({
        type: 'error',
        title: 'فشل الاتصال بالنظام.',
        body: 'خدمة قاعدة البيانات غير متاحة حالياً. يرجى المحاولة لاحقاً.',
      });
      return;
    }
    
    if (!user) {
      setPaymentMessage({
        type: 'error',
        title: 'يرجى تسجيل الدخول أولاً!',
        body: 'لا يمكننا تسجيل طلب الشراء دون معرفة هويتك.',
      });
      return;
    }

    const purchaseCollectionPath = `/artifacts/${appId}/public/data/digital_purchases`;
    const purchaseData = {
      userId: user.uid,
      productId: productName,
      price: price,
      status: 'Awaiting Payment',
      purchaseDate: new Date().toISOString(),
    };

    try {
      // Use the non-blocking update function
      addDocumentNonBlocking(collection(firestore, purchaseCollectionPath), purchaseData);
      
      setPaymentMessage({
        type: 'success',
        title: '✅ تم تسجيل طلب الشراء بنجاح!',
        body: `يرجى دفع مبلغ <strong>${price} ج.م</strong> لإكمال العملية. <br/>
               <strong>خطوات الدفع:</strong> قم بالتحويل البنكي أو تواصل معنا عبر واتساب الآن لتزويدك برابط دفع آمن. <br/>
               <span class="font-bold text-blue-600">سنرسل لك المنتج (${productName}) فور تأكيد الدفع يدوياً.</span>`,
      });
      
    } catch (error: any) {
       // The non-blocking function handles permission errors via the global listener.
       // This catch block is for other potential errors during the initial call.
       setPaymentMessage({
        type: 'error',
        title: '❌ فشل تسجيل الطلب.',
        body: `حدث خطأ غير متوقع: ${error.message}`,
      });
    }
  };

  return (
    <div className="store-body antialiased">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/store" className="text-3xl font-bold text-[#0b4e8d]">كنوز النيل</a>
          <div className="text-sm text-gray-600">متجر برديات العامية</div>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">
            برديات العامية: منتجات رقمية فريدة
          </h1>
          <p className="text-center text-gray-600 mb-12">
            منتجات فورية تساعدك على فهم الثقافة المصرية وتاريخها اللغوي.
          </p>
          
          {isUserLoading && (
            <div className="text-center mb-8">
              <p className="text-lg font-semibold text-blue-600">جاري تأمين الاتصال بالنظام...</p>
            </div>
          )}

          {paymentMessage && (
            <div className={`p-4 rounded-lg text-right mb-8 ${paymentMessage.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`} role="alert">
              <p className="font-bold text-lg mb-2">{paymentMessage.title}</p>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: paymentMessage.body }}></p>
            </div>
          )}

          {showProducts && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="product-card bg-white p-6 rounded-xl border-t-4 border-yellow-500">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">1. برديّة وصفة الماموث</h3>
                  <p className="text-gray-600 mb-4">وثيقة تاريخية ممتعة تشرح طريقة طبخ الطعام المصري عبر العصور القديمة بالعامية.</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-3xl font-extrabold text-yellow-600">300 ج.م</span>
                    <button onClick={() => buyProduct('Bardiyyat_Mammoth', 300)} className="buy-button text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                      شراء البرديّة الآن
                    </button>
                  </div>
                </div>
                
                <div className="product-card bg-white p-6 rounded-xl border-t-4 border-purple-500">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">2. مجموعة تحديات التاكسي المتقدمة</h3>
                  <p className="text-gray-600 mb-4">50 حواراً إضافياً بمستويات متقدمة لمواقف حياتية أكثر تعقيداً في الشارع المصري.</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-3xl font-extrabold text-purple-600">500 ج.م</span>
                    <button onClick={() => buyProduct('Adult_Challenges_Pack', 500)} className="buy-button text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                      شراء التحديات الآن
                    </button>
                  </div>
                </div>
              </div>
              
              {!user && !isUserLoading && (
                <div className="text-center mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <strong>يرجى تسجيل الدخول أولاً!</strong> يجب أن تكون مسجلاً لتتمكن من تسجيل طلب الشراء الخاص بك.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
```