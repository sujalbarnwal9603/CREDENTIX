import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckIcon } from 'lucide-react'

interface PricingCardProps {
  tier: string
  price: string
  features: string[]
  buttonText: string
  isComingSoon?: boolean
  onButtonClick?: () => void
}

export function PricingCard({
  tier,
  price,
  features,
  buttonText,
  isComingSoon = false,
  onButtonClick,
}: PricingCardProps) {
  return (
    <Card className="flex flex-col justify-between w-full max-w-sm bg-gray-900 text-white border-gray-700 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-400">{tier}</CardTitle>
        <CardDescription className="text-gray-300 mt-2">
          <span className="text-5xl font-extrabold">{price}</span>
          {tier !== "Free" && <span className="text-xl text-gray-400">/month</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3 text-gray-300">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isComingSoon}
          onClick={onButtonClick}
        >
          {isComingSoon ? "Coming Soon" : buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}
