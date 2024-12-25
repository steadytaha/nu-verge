'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditUserProfileSchema } from '@/lib/types';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

type Props = {
    user: any;
    onUpdate?: (name: string) => any;
};

const ProfileForm = ({ user, onUpdate }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof EditUserProfileSchema>>({
        mode: 'onChange',
        resolver: zodResolver(EditUserProfileSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const handleSubmit = async (values: z.infer<typeof EditUserProfileSchema>) => {
        setIsLoading(true);
        try {
            await onUpdate?.(values.name);
        } catch (error) {
            console.error('Failed to update:', error);
            // Optionally show an error message
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Defer resetting the form state until after rendering is complete
        form.reset({ name: user.name, email: user.email });
    }, [user, form]);

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Name"
                                    disabled={isLoading}
                                />
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
                            <FormLabel className="text-lg">Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Email"
                                    type="email"
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className={`self-start hover:bg-[#2F006B] hover:text-white ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </>
                    ) : (
                        'Save User Settings'
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default ProfileForm;
