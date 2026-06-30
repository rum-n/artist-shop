'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function About() {
  const [aboutContent, setAboutContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/settings/about-me');
        const data = await response.json();
        setAboutContent(data.content || '');
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <>
      <Navbar currentPath="/about" />

      <main className="container mx-auto px-4 py-8">
        <section className="about-header py-8">
          <h1 className="text-4xl font-bold mb-4 text-center">Биография и визия</h1>
        </section>

        <section className="about-content max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="relative h-80 md:h-full rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/villy1.webp"
                  alt="Violetta Boyadzhieva"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  // Fallback for missing image
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x600?text=Artist+Portrait";
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Биография</h2>
              <p className="text-gray-700 mb-4">
                1988 - Родена в гр. София, България <br />
                2009 - Завършва Гимназия по Строителство и Архитектура в гр. София <br />
                2013 - Завършва Магистратура по Ландшафтна Архитектура в Лесотехническия университет в гр. София <br />
                2016-2017 - Живее и работи в Германия като Ландшафтен архитект <br />
                2018 - Започва своя път като художник на свободна практика в България
              </p>
            </div>
          </div>

          <div className="container mx-auto py-12">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : aboutContent ? (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{aboutContent}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-center text-gray-500">No about content available yet.</p>
            )}
          </div>

          {/* <div className="artist-statement mb-12">
            <h2 className="text-2xl font-semibold mb-4">Визия, вдъхновение и цели</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-4 italic">
                &quot;Работата ми се стреми да свърже нематериалното и видимото, улавяйки ефимерните моменти, които се намират между осезаемия свят и нашите вътрешни пейзажи. Чрез сливане на фигуративно изкуство, пейзажи и натюрморти, аз изследвам как емоциите, сезоните и природата се преплитат, за да оформят нашите преживявания.
              </p>
              <p className="text-gray-700 mb-4 italic">
                Светлината, цветът и текстурата се превръщат в усещане - превеждайки тънкостите на вътрешните състояния във визуални форми. Кожата се превръща в платно за емоции, не само като физическа граница, но и като повърхност, където се срещат външното и вътрешното, където личните истории и мимолетните усещания се проявяват.
              </p>
              <p className="text-gray-700 mb-4 italic">
                Сменящите се сезони служат както като метафора, така и като муза, тяхната циклична природа отразява постоянно променящата се природа на нашите чувства. Магическият реализъм прониква в моя подход, където обикновеното се трансформира в необикновеното, разкривайки скрит свят, където чувствата цъфтят като цветя и въздухът е наситен с истории, чакащи да бъдат разказани. Чрез моите картини каня зрителя да влезе в царство на тиха трансформация – такова, където магическото и ефимерното се сблъскват.
              </p>
              <p className="text-gray-700 italic">Цветът и неговото пътуване във водата са движеща сила в работата ми и намирам несекващо вдъхновение в неговите фини нюанси и сложни взаимоотношения.&quot;</p>
            </div>
          </div> */}

          <div className="contact-info mb-12">
            <h2 className="text-2xl font-semibold mb-4">За контакт</h2>
            <p className="text-gray-700 mb-6">
              Ако имате въпроси относно наличност на картини, поръчки, техника, материали или други, свържете се с мен. Можете да ме намерите и в моето студио в жк Левски Г, свържете се с мен предварително, ако искате да посетите и да разгледате картини на място.
            </p>
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="font-medium text-lg mb-2">Свържете се с мен</h3>
                <p className="text-gray-600">Email: vboyadzhieva@outlook.com</p>
                <p className="text-gray-600">Тел: +359 876 724 665</p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Студио</h3>
                <p className="text-gray-600">жк. Левски Г</p>
                <p className="text-gray-600">София, България</p>
              </div>
            </div>
          </div>

          <div className="cta-section text-center py-8">
            <h2 className="text-2xl font-semibold mb-6">Разгледайте произведенията</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/gallery"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
              >
                Галерия
              </Link>
              <Link
                href="/shop"
                className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition"
              >
                Онлайн магазин
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}